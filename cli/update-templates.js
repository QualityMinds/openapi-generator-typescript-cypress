#!/usr/bin/env node

import { execa } from 'execa';
import { existsSync } from 'fs';
import { mkdtemp } from 'fs/promises';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const REPO_NAME = 'openapi-generator-typescript-cypress';
const REPO = `https://github.com/QualityMinds/${REPO_NAME}.git`;
const TEMPLATE_FOLDER = 'typescript-cypress-templates';

const targetTemplateFolder = process.argv[2] || TEMPLATE_FOLDER;
const DESTINATION = path.resolve('.', targetTemplateFolder);

async function main() {
    let tmpDir;
    try {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), `${REPO_NAME}-clone-`));
    } catch (err) {
        console.error("❌ Template folder couldn't be created due to following error:", err.message);
        process.exit(1);
    }
    console.log('📁 Created temporary folder:', tmpDir);
    console.log('📥 Cloning template from repo:', REPO);

    try {
        await execa('git', ['clone', '--depth', '1', REPO, tmpDir]);
        const sourcePath = path.join(tmpDir, TEMPLATE_FOLDER);

        if (!existsSync(sourcePath)) {
            console.error('❌ Template folder not found in the cloned repository.');
            process.exit(1);
        }

        console.log('📂 Copying templates to:', DESTINATION);
        await fs.copy(sourcePath, DESTINATION, { overwrite: true });
        console.log('✅ Templates updated successfully!');
    } catch (err) {
        console.error('🚨 Failed to update templates due to following error:', err.message);
        process.exit(1);
    } finally {
        if (tmpDir) {
            await fs.remove(tmpDir);
            console.log('🧹 Temporary folder deleted:', tmpDir);
        }
    }
}

main();
