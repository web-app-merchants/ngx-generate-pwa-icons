# Ngx Generate PWA Icons

This Angular schematic generates a set of pwa icons based on a custom .png logo.

Use it after adding @angular/pwa with schematics.

### Usage

#### _1. Install @angular/pwa_

```sh
ng add @angular/pwa --project project-name
```

#### _2. Add logo_

Add a .png with the name logo.png in the public folder, or the assets folder for projects that were generated before v18.

#### _3. Run the schematic to generate custom logos_

```sh
ng add @ngwam/ngx-generate-pwa-icons --projectName project-name
```
