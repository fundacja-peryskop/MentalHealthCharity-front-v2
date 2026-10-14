/**
 * Registers the Peryskop design-system Tamagui config with TypeScript so custom
 * tokens (`$primary`, `$lg`, …) and the config's media queries (`$md`, `$sm`,
 * `$maxMd`, …) are type-checked on Tamagui props across the app.
 *
 * The augmentation also ships inside `@fundacja-peryskop/ui`, but re-declaring it
 * in the app's own source guarantees the compiler picks it up.
 */
import type { AppConfig } from "@fundacja-peryskop/ui/tamagui.config";

declare module "tamagui" {
    // Empty extension is the intended Tamagui augmentation shape.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface TamaguiCustomConfig extends AppConfig {}
}
