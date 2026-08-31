# MCP Sitemap
This repository contains the boilerplate to develop and build a sitemap for MCP, granting some benefits over developing the sitemap directly:
- Divides the sitemap in small files;
- Maintenance is easier and more secure, only editing the necessary files;
- Adding new pages to the sitemap is done in separeted files, being necessary only adding it in the necessary sitemap config objects;
- Uses git and github for versioning and backup.

## Folder Structure
This repository has a structure that divides the sitemap in various files, which helps maintaining and the continuous development of the sitemap.

```
src
├── main.js                       // Main sitemap file
├── helpers                       // Helper functions
│   └── createListener.js
├── model                         
│   ├── domain.js                 // Sitemap domains 
│   └── events.js                 // Listener events (click, mousedown, hover etc)
└── salesforce-interaction        
    ├── config
    │   ├── homolog-config.js     // Sitemap configuration for homol
    │   └── prod-config.js        // Sitemap configuration for production
    └── page-types
        ├── default.js            // Default pagetype
        ├── global.js             // Global pagetype
        ├── ...                   // Other pagetypes
```
The `page-types` should contain all the pagetypes in dedicated files, so the maintenance can be easily achieved by modifying only the necessary file.

Adding a new pagetype involves adding a new file containing the code for the new page and then importing and adding it in the necessary config files at `/config`:

```
  config.pageTypes = [
    pageTypeHome,
    pageTypeProductPage,
    // Import and add the new pagetype in this array.
  ]
```

## Usage

After editing the files, the following command will build the complete sitemap which should be included in the site-wide javascript configuration in MCP:

```
pnpm build
```

Upon the sucess build, the file can be found at `/dist/index.js`.


Is also possible to build a minified version of the sitemap, which increases the site performance, but renders the sitemap pratically unreadable after the build.
```
pnpm minify
```

## Useful Documentations
- [Getting Started Sitemap](https://developer.salesforce.com/docs/marketing/personalization/guide/sitemapping-getting-started.html)
- [Sitemap Implementation](https://developer.salesforce.com/docs/marketing/personalization/guide/sitemap-implementation.html)
- [Interation Object Definition](https://developer.salesforce.com/docs/marketing/personalization/guide/interaction-definitions.html)
- [Ecommerce Sitemap Example](https://developer.salesforce.com/docs/marketing/personalization/guide/ecommerce.html)
- [MCP Chrome Extension](https://chromewebstore.google.com/detail/salesforce-interactions-s/mhmpepeohaddbhkhecaldflljggicedf?hl=en&pli=1) 