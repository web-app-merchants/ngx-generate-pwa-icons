import {Schema} from "./schema.interface";
import {Rule, SchematicContext, Tree} from "@angular-devkit/schematics";
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import {ProjectType} from "@schematics/angular/utility/workspace-models";
import * as Jimp from 'jimp';

export default function (options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const workspace = await getWorkspace(tree);
        const {projectName} = options;

        const project = getProjectFromWorkspace(workspace, projectName);
        const sourceRoot = project.sourceRoot;
        const assetsDirectory = tree.getDir(`${sourceRoot}/assets`);
        const assetFolder = (assetsDirectory.subfiles.length !== 0 && assetsDirectory.subdirs.length !== 0) ? `${sourceRoot}/assets` : 'public';
        const logoPath = `${assetFolder}/logo.png`;

        const hasLogoInAssets = tree.exists(logoPath);

        if (hasLogoInAssets) {

            if (project.extensions.projectType === ProjectType.Application) {
                const logo = tree.read(logoPath);
                const iconSizes = [512, 384, 192, 180, 152, 144, 128, 96, 72, 48, 32, 16];

                if (logo) {
                    context.logger.info(`⌛ Generating PWA icons`);
                    const jimpLogo = await Jimp.read(logo);


                    for (const size of iconSizes) {
                        const iconName = `icon-${size.toString()}x${size.toString()}.png`;
                        const iconPath = `${assetFolder}/icons/${iconName}`;

                        const resizedJimpIcon = jimpLogo.resize(size, size);

                        if (iconName === 'icon-180x180.png') {
                            await resizedJimpIcon.writeAsync(`${assetFolder}/apple-touch-icon.png`);
                            context.logger.info(`✓ ${assetFolder}/apple-touch-icon.png`);

                            await resizedJimpIcon.writeAsync(`${sourceRoot}/apple-touch-icon.png`);
                            context.logger.info(`✓ ${sourceRoot}/apple-touch-icon.png`);

                        } else {
                            await resizedJimpIcon.writeAsync(iconPath);
                            context.logger.info(`✓ ${iconPath}`);
                        }
                    }

                    return;

                } else {
                    context.logger.error(`✗ logo.png must be in the assets folder, could not find: "${logoPath}"`);
                    return;
                }

            } else {
                return;
            }

        } else {
            context.logger.error(`✗ logo.png must be in the assets folder, could not find: "${logoPath}"`);
        }
    };
}
