# ReFocus Chrome Extension

This extension helps you stay focused by redirecting you from distracting websites to a list of productive sites that you curate.

## How to Install

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **"Developer mode"** using the toggle switch in the top-right corner.
3.  Click the **"Load unpacked"** button that appears.
4.  In the file selection dialog, choose the `refocus` directory that contains this `README.md` file.
5.  The extension should now be loaded and active! You will see its icon in the Chrome toolbar.

## How to Use

### Blocking a Site
- When you are on a site you want to block, click the extension's icon in the toolbar and click the **"Block this site"** button.

### Building Your Productive "Reading List"
- When you are on a site you'd like to be redirected to in the future, click the extension's icon and click the **"Add to Productive List"** button.

### Managing Your Lists
- To see and manage all your blocked and productive sites, right-click the extension icon and select **"Options"**, or click the "Settings" link in the popup. This will open a page where you can manually add or remove sites from both lists.

### How it Works
- Once a site is on your block list, navigating to it will automatically redirect you to one of the sites from your "Productive Sites" list.

## Automation

### Development and Testing

For development, you can load the extension as an "unpacked extension" using the steps in the "How to Install" section.

When you make changes to the code, you'll need to reload the extension to see the changes. You can do this by:
1.  Going to `chrome://extensions`.
2.  Finding your "ReFocus" extension.
3.  Clicking the "reload" icon (a circular arrow).

For a more advanced development setup with auto-reloading, you can look into tools like `webpack` with the `webpack-extension-reloader` plugin.

### Chrome Web Store Uploads

Automating the upload process to the Chrome Web Store can save you time and effort. This is typically done using the [Chrome Web Store API](https://developer.chrome.com/docs/webstore/api/).

The general steps are:
1.  Set up a project in the Google Cloud Console.
2.  Enable the "Chrome Web Store API".
3.  Create OAuth 2.0 credentials.
4.  Use a script or a tool to authenticate with the API and upload your extension's `.zip` file.

There are also third-party tools and GitHub Actions that can simplify this process for you:
-   [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli): A command-line tool for uploading and publishing extensions.
-   [release-chrome-extension](https://github.com/marketplace/actions/release-chrome-extension): A GitHub Action that can automate the release process.
