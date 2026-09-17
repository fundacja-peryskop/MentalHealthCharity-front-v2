import process from "node:process";
import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const temporary = await mkdtemp(join(root, "node_modules", ".chat-tests-"));
try {
    const outfile = join(temporary, "chat.test.cjs");
    await build({
        entryPoints: ["tests/chat-reliability.test.tsx"],
        outfile,
        bundle: true,
        external: ["react", "react-dom", "react-test-renderer"],
        platform: "node",
        format: "cjs",
        jsx: "automatic",
        logLevel: "silent",
        define: { "import.meta.env": "{}" },
        plugins: [
            {
                name: "test-environment",
                setup(build) {
                    build.onResolve(
                        {
                            filter: /AuthProvider$|react-use-websocket$|react-i18next$|react-router-dom$|locales\/i18n$|getAuthHeaders$|handleApiError$|js-cookie$|\/Modal$|\/SearchUser$|^@\/components\/ui\/(button|input)$/,
                        },
                        (args) => ({ path: args.path, namespace: "test-shell" })
                    );
                    build.onLoad({ filter: /.*/, namespace: "test-shell" }, (args) => {
                        let contents;
                        if (args.path.endsWith("AuthProvider"))
                            contents = `import {state} from '${resolve("tests/chat-test-state.ts")}'; export const useUser=()=>({user:state.user});`;
                        else if (args.path === "react-use-websocket")
                            contents = `import {state} from '${resolve("tests/chat-test-state.ts")}'; export const ReadyState={CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3,UNINSTANTIATED:-1}; export default (url,options)=>{state.socketOptions=options;return {readyState:state.socketState,getWebSocket:()=>({close:()=>{state.closedSockets++;}})};};`;
                        else if (args.path === "react-i18next")
                            contents = "export const useTranslation=()=>({t:(key)=>key});";
                        else if (args.path.endsWith("locales/i18n"))
                            contents = "export default {t:(key,opts)=>opts?.id ? `Chat #${opts.id}` : key};";
                        else if (args.path === "react-router-dom")
                            contents = `export const Link=({to,children,...props})=><a href={to} {...props}>{children}</a>;`;
                        else if (args.path === "js-cookie") contents = 'export default {get:()=>"test-token"};';
                        else if (args.path.endsWith("getAuthHeaders")) contents = "export default ()=>({});";
                        else if (args.path.endsWith("handleApiError"))
                            contents = 'export default async data=>{throw new Error(data.detail || "API error")};';
                        else if (args.path.endsWith("/Modal"))
                            contents =
                                "export default ({children,onClose})=><section><button data-cancel onClick={onClose}>Cancel</button>{children}</section>;";
                        else if (args.path.endsWith("/SearchUser"))
                            contents = "export default props=><search-user {...props}/>;";
                        else if (args.path.endsWith("/input"))
                            contents = "export const Input=props=><input {...props}/>;";
                        else contents = "export const Button=props=><button {...props}/>;";
                        return { contents, loader: "jsx", resolveDir: root };
                    });
                },
            },
        ],
    });
    const result = spawnSync(process.execPath, ["--test", "--test-reporter=tap", "--test-timeout=10000", outfile], {
        stdio: "inherit",
    });
    process.exitCode = result.status ?? 1;
} finally {
    await rm(temporary, { recursive: true, force: true });
}
