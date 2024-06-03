import {Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {NodePackageInstallTask, RunSchematicTask} from '@angular-devkit/schematics/tasks';
import {addDevPackageToPackageJson} from './package-config';
import {Schema} from './schema.interface';

export default function (options: Schema): Rule {
  return (host: Tree, context: SchematicContext) => {
    const {projectName} = options;

    if (projectName) {
      addDevPackageToPackageJson(host, 'jimp', '0.22.10');
      addDevPackageToPackageJson(host, 'to-ico', '1.1.5');

      const installTaskId = context.addTask(new NodePackageInstallTask());
      const setupProjectIconsTaskID = context.addTask(new RunSchematicTask('ng-add-setup-project-icons', options), [installTaskId]);
      context.addTask(new RunSchematicTask('ng-add-setup-project-favicon', options), [setupProjectIconsTaskID]);
    } else {
      context.logger.error('✗ No project name provided');
      return;
    }
  };
}
