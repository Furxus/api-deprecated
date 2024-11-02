import { InferSchemaType, Schema, model } from "mongoose";

const serverSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        nameAcronym: {
            type: String
        },
        icon: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        owner: {
            type: String,
            required: true
        },
        invites: [
            {
                code: {
                    type: String,
                    required: true
                },
                uses: {
                    type: Number,
                    default: 0
                },
                maxUses: {
                    type: Number,
                    default: 0
                },
                createdBy: {
                    type: String,
                    required: true
                },
                expiresAt: {
                    type: Date,
                    default: null
                },
                expiresTimestamp: {
                    type: Number,
                    default: null
                },
                createdAt: {
                    type: Date,
                    required: true
                },
                createdTimestamp: {
                    type: Number,
                    required: true
                }
            }
        ],
        members: [String],
        channels: [String],
        roles: [String],
        createdAt: {
            type: Date,
            required: true
        },
        createdTimestamp: {
            type: Number,
            required: true
        },
        updatedAt: Date,
        updatedTimestamp: Number
    },
    {
        methods: {
            generateInviteLink: function (
                serverId: string,
                memberId: string,
                maxUses: number = 0,
                expiresAt?: Date
            ) {
                // Generate 9 random characters
                const characters =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let code = "";
                for (let i = 0; i < 9; i++) {
                    code += characters.charAt(
                        Math.floor(Math.random() * characters.length)
                    );
                }

                this.invites.push({
                    code,
                    maxUses,
                    expiresAt,
                    server: serverId,
                    createdBy: memberId,
                    createdAt: new Date(),
                    createdTimestamp: Date.now()
                });

                return code;
            }
        }
    }
);

serverSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        nameAcronym: this.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
    });

    next();
});

serverSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        nameAcronym: this.get("name")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
    });

    next();
});

export type IServer = InferSchemaType<typeof serverSchema>;

const serverModel = model("servers", serverSchema);

export type ServerDocument = ReturnType<(typeof serverModel)["hydrate"]>;

export default serverModel;
