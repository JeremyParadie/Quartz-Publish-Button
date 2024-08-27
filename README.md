# Quartz Publish Button, an Obsidian Plugin

This is a simple plugin that adds a button in the ribbon (left sidebar) of Obsidian. When the button is pressed, the command `npx quartz sync` is run, which will use the content in the Quartz directory specified in the plugin settings page to build and publish a static site. 

This Obsidian plugin is intended to be used with [Quartz](https://github.com/jackyzha0/quartz), a static site generator commonly used to create websites from Obsidian markdown files. Usage of this plugin assumes you have already installed and set up Quartz and Github.

# How to install via BRAT
1. Open an Obsidian vault
2. Open Settings
3. On the "Community plugins" page, Turn on community plugins if not on already.
4. On the "Community plugins" page, Click the "Browse" button
5. Search for "BRAT"
6. Choose BRAT
7. Click "Install" button
8. Click "Enable" button
9. Click "Options" button
6. Click "Add Beta Plugin" button
7. Paste the following URL in the text field `https://github.com/JeremyParadie/Quartz-Publish-Button`
8. Keep "Enable after installing the plugin" checked
9. Click "Add Plugin" button

# How to set up the plugin
1. Open Settings
2. On the "Quartz Publish Button" page, enter the location of the directory of your Quartz installation.

Congrats! Now you can press the rocket icon whenever you want to publish via Quartz!
