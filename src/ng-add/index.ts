
import {chain, Rule, SchematicContext, SchematicsException, Tree} from "@angular-devkit/schematics";
import {Schema} from "./schema.interface";
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {ProjectType} from "@schematics/angular/utility/workspace-models";
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import {NodePackageInstallTask} from "@angular-devkit/schematics/tasks";
import * as fs from 'fs/promises';
import * as Jimp from 'jimp';
import * as toIco from 'to-ico';

export default function (options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const {projectName} = options;

    if (projectName) {
      const project = getProjectFromWorkspace(workspace, projectName);
      const sourceRoot = project.sourceRoot;
      const assetFolder = tree.exists(`${sourceRoot}/assets`) ? `${sourceRoot}/assets` : 'public';
      const logoPath = `${assetFolder}/logo.png`;
      const hasLogoInAssets = tree.exists(logoPath);

      if (hasLogoInAssets) {
        const logo = await fs.readFile(logoPath);

          context.logger.info(`⌛ Generating PWA icons`);

          context.addTask(new NodePackageInstallTask());

          if (project.extensions.projectType === ProjectType.Application) {
            return chain([
                addPackageToPackageJson(),
                addLogoIconsToAssetsFolder(project, logo),
                addFaviconToRootFolder(project)
            ]);
          }
      } else {
        context.logger.error(`✗ logo.png must be in the assets folder, could not find: "${logoPath}"`);
        return;
      }
    }
  }
}

function addLogoIconsToAssetsFolder(
    project: ProjectDefinition,
    logo: Buffer
): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const sourceRoot = project.sourceRoot;
    const assetFolder = tree.exists(`${sourceRoot}/assets`) ? `${sourceRoot}/assets` : 'public';
    const iconsFolder = `${assetFolder}/icons`;
    const iconSizes = [512, 384, 192, 180, 152, 144, 128, 96, 72, 48, 32, 16];

    const jimpLogo = await Jimp.read(logo);

    for (const size of iconSizes) {
      const iconName = size !== 180 ? `icon-${size.toString()}x${size.toString()}.png` : 'apple-touch-icon.png';
      const iconPath = size !== 180 ? `${iconsFolder}/${iconName}` : `${sourceRoot}/${iconName}`;

      const resizedJimpIcon = jimpLogo.resize(size, size);
      resizedJimpIcon.write(iconPath);

      if (tree.exists(iconPath)) {
        tree.overwrite(iconPath, resizedJimpIcon.bitmap.data);
      } else {
        tree.create(iconPath, resizedJimpIcon.bitmap.data);
      }

      context.logger.info(`✓ ${iconPath}`);
    }
  }
}

function addFaviconToRootFolder(project: ProjectDefinition): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const sourceRoot = project.sourceRoot;
    const assetFolder = tree.exists(`${sourceRoot}/assets`) ? `${sourceRoot}/assets` : 'public';
    const iconsFolder = `${assetFolder}/icons`;

    const faviconContents = [
      await fs.readFile(`${iconsFolder}/icon-16x16.png`),
      await fs.readFile(`${iconsFolder}/icon-32x32.png`),
      await fs.readFile(`${iconsFolder}/icon-48x48.png`)
    ];

    const favicon = await toIco(faviconContents);

    if (tree.exists(`${sourceRoot}/favicon.ico`)) {
      tree.overwrite(`${sourceRoot}/favicon.ico`, favicon);
    } else {
      tree.create(`${sourceRoot}/favicon.ico`, favicon);
    }


    context.logger.info(`✓ ${sourceRoot}/favicon.ico`);

    context.logger.info(`★ Finished`);
  }
}

function addPackageToPackageJson(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkgPath = '/package.json';
    const buffer = tree.read(pkgPath);

    if (!buffer) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());

    if (!pkg.dependencies) {
      pkg.dependencies = {};
    }

    pkg.dependencies['jimp'] = '0.22.10';
    pkg.dependencies['to-ico'] = '1.1.5';

    tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2));

    context.logger.info(`✓ jimp Installed`);
    context.logger.info(`✓ to-ico Installed`);

    return tree;
  };
}
