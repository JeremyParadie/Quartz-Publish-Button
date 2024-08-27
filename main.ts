import { App, Plugin, PluginSettingTab, Setting, Notice, normalizePath } from 'obsidian';
import * as fs from 'fs';

const { exec } = require('child_process');

interface QuartzPublishButtonPluginSettings {
    quartzPath: string;
    commandOverride?: string; // New optional field for command override
}

const DEFAULT_SETTINGS: QuartzPublishButtonPluginSettings = {
    quartzPath: ''
}

export default class QuartzPublishButtonPlugin extends Plugin {
    settings: QuartzPublishButtonPluginSettings;

    async onload() {
        await this.loadSettings();

        // Create a button in the ribbon (left sidebar)
        const ribbonIconEl = this.addRibbonIcon('rocket', 'Run Quartz Sync', () => {
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

        // Use commandOverride if it exists, otherwise use the default command
        const command = this.settings.commandOverride 
            ? this.settings.commandOverride 
            : `cd ${this.settings.quartzPath} && npx quartz sync`;

        exec(command, (error, stdout, stderr) => {
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

// Settings Tab for configuring the Quartz repository path and command override
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
            .setName('Quartz repository location')
            .setDesc('The path to the folder that contains the Quartz files.')
            .addText(text => text
                .setPlaceholder('Quartz repo path')
                .setValue(this.plugin.settings.quartzPath)
                .onChange(async (value) => {
                    this.plugin.settings.quartzPath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Command Override')
            .setDesc('Override the default Quartz sync command. Use only if you know what you\'re doing.')
            .addText(text => text
                .setPlaceholder('Command override')
                .setValue(this.plugin.settings.commandOverride || '')
                .onChange(async (value) => {
                    this.plugin.settings.commandOverride = value;
                    await this.plugin.saveSettings();
                }));
    }
}
