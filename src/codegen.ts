import type { CodegenConfig } from "@graphql-codegen/cli";

// For now we do not even use this, I am planning to rework it and make it better for sure
const config: CodegenConfig = {
    schema: "src/schema.graphql",
    generates: {
        "./src/@types": {
            preset: "graphql-modules",
            presetConfig: {
                baseTypesPath: "graphql.ts",
                filename: "graphql.ts"
            },
            plugins: [
                {
                    add: {
                        content:
                            "/* eslint-disable @typescript-eslint/ban-types */\n"
                    }
                },
                "typescript",
                "typescript-operations",
                "typescript-resolvers"
            ]
        }
    },
    hooks: {
        afterOneFileWrite: ["prettier --write"]
    }
};

export default config;
