import {Schema} from "./schema.interface";
import {Rule, SchematicContext, Tree} from "@angular-devkit/schematics";
import {getWorkspace} from '@schematics/angular/utility/workspace';
import {getProjectFromWorkspace} from '@angular/cdk/schematics';
import * as fs from 'fs/promises';
import * as toIco from 'to-ico';

export default function (options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const workspace = await getWorkspace(tree);
        const {projectName} = options;

        const project = getProjectFromWorkspace(workspace, projectName);
        const sourceRoot = project.sourceRoot;
        const assetFolder = tree.exists(`${sourceRoot}/assets`) ? `${sourceRoot}/assets` : 'public';

        const iconsFolder = `${assetFolder}/icons`;

        const faviconContents: Buffer[] = [];

        if (tree.exists(`${iconsFolder}/icon-16x16.png`)) {
            const icon16 = tree.read(`${iconsFolder}/icon-16x16.png`);

            if (icon16) {
                faviconContents.push(icon16);
            }
        }

        if (tree.exists(`${iconsFolder}/icon-32x32.png`)) {
            const icon32 = tree.read(`${iconsFolder}/icon-32x32.png`);

            if (icon32) {
                faviconContents.push(icon32);
            }
        }

        if (tree.exists(`${iconsFolder}/icon-48x48.png`)) {
            const icon48 = tree.read(`${iconsFolder}/icon-48x48.png`);

            if (icon48) {
                faviconContents.push(icon48);
            }
        }

        const favicon = await toIco(faviconContents);

        if (tree.exists(`${sourceRoot}/favicon.ico`)) {
            await fs.unlink(`${sourceRoot}/favicon.ico`);
        }

        if (tree.exists(`${assetFolder}/favicon.ico`)) {
            await fs.unlink(`${assetFolder}/favicon.ico`);
        }

        if (faviconContents.length > 0) {
            await fs.writeFile(`${sourceRoot}/favicon.ico`, favicon);
            context.logger.info(`✓ ${sourceRoot}/favicon.ico`);

            await fs.writeFile(`${assetFolder}/favicon.ico`, favicon);
            context.logger.info(`✓ ${assetFolder}/favicon.ico`);

            context.logger.info(`★ Finished`);
        }

        return;
    };
}
