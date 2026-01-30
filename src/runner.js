import { input } from '@inquirer/prompts';
import { execa } from 'execa';

export async function runCli() {
    try {
        // Ask for project name
        const projectName = await input({
            message: 'Enter Angular project name:',
            validate: (value) => value ? true : 'Project name is required'
        });

        // Ask for library (with exact version)
        const libraryWithVersion = await input({
            message: 'Enter library to pre-install (name@version):',
            validate: (value) => value.includes('@') ? true : 'Please include @version (e.g., lodash@4.17.21)'
        });

        console.log(`\n👉 Creating Angular project: ${projectName} ...\n`);

        await execa('npx', ['@angular/cli', 'new', projectName, '--skip-install'], {
            stdio: 'inherit'
        });

        console.log(`\n📦 Installing ${libraryWithVersion} ...\n`);

        await execa('npm', ['install', libraryWithVersion], {
            cwd: projectName,
            stdio: 'inherit'
        });

        console.log(`\n📥 Installing Angular dependencies ...\n`);

        await execa('npm', ['install'], {
            cwd: projectName,
            stdio: 'inherit'
        });

        console.log('\n✅ All done! 🚀');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
}