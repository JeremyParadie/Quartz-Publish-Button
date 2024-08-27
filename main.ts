import { App, Plugin, PluginSettingTab, Setting, Notice, normalizePath } from 'obsidian';
import * as fs from 'fs';

const { exec } = require('child_process');

interface QuartzPublishButtonPluginSettings {
    quartzPath: string;
}

const DEFAULT_SETTINGS: QuartzPublishButtonPluginSettings = {
    quartzPath: 'default'
}

export default class QuartzPublishButtonPlugin extends Plugin {
    settings: QuartzPublishButtonPluginSettings;

    async onload() {
        await this.loadSettings();

        // Create a button in the ribbon (left sidebar)
        const ribbonIconEl = this.addRibbonIcon('rocket', 'Sync to Quartz', () => {
            this.runQuartzSync();
        });

        ribbonIconEl.addClass('quartz-publish-button-ribbon');

        // Add commands to Obsidian's command palette
        this.addCommand({
            id: 'run-quartz-sync',
            name: 'Run Quartz Sync',
            callback: () => this.runQuartzSync()
        });

        // Add the settings tab to configure the plugin
        this.addSettingTab(new QuartzPublishButtonPluginSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // Function to validate Quartz path
    validateQuartzPath(): boolean {
        if (this.settings.quartzPath === 'default' || this.settings.quartzPath.trim() === "") {
            new Notice('Error: Missing Quartz Path. Please set one in Quartz Publish Button plugin settings.', 10000);
            return false;
        }

        const path = normalizePath(this.settings.quartzPath);
        if (!fs.existsSync(path)) {
            new Notice('Error: Quartz path does not exist!\nPlease check the path in the Quartz Publish Button plugin settings.', 10000);
            return false;
        }

        return true;
    }

    // Function to run Quartz sync
    runQuartzSync() {
        if (!this.validateQuartzPath()) return;

        new Notice('Publishing with Quartz...');

        exec(`cd ${this.settings.quartzPath} && npx quartz sync`, (error, stdout, stderr) => {
            if (error) {
                new Notice(`Execution Error: ${error.message}`, 40000);
                return;
            }
            if (stderr && stderr.toLowerCase().includes("error")) {
                new Notice(`Error: ${stderr}`, 40000);
                return;
            }
            if (stdout) {
                new Notice(`${stdout}\n\n(click to dismiss)`, 100000);
            }
        });
    }
}

// Settings Tab for configuring the Quartz repository path
class QuartzPublishButtonPluginSettingTab extends PluginSettingTab {
    plugin: QuartzPublishButtonPlugin;

    constructor(app: App, plugin: QuartzPublishButtonPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Quartz Repository Location')
            .setDesc('The path to the folder that contains the Quartz files.')
            .addText(text => text
                .setPlaceholder('Quartz repo path')
                .setValue(this.plugin.settings.quartzPath)
                .onChange(async (value) => {
                    this.plugin.settings.quartzPath = value;
                    await this.plugin.saveSettings();
                }));
    }
}
