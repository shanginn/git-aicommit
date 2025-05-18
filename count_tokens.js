export const getModelNameForTiktoken = (modelName) => {
    if (modelName.startsWith("gpt-3.5-turbo-16k")) {
        return "gpt-3.5-turbo-16k";
    }

    if (modelName.startsWith("gpt-3.5-turbo-")) {
        return "gpt-3.5-turbo";
    }

    if (modelName.startsWith("gpt-4-32k-")) {
        return "gpt-4-32k";
    }

    if (modelName.startsWith("gpt-4-")) {
        return "gpt-4";
    }

    if (modelName.startsWith("gpt-4o-")) {
        return "gpt-4o";
    }

    if (modelName.startsWith("gpt-4.1")) {
        return "gpt-4o";
    }
    return modelName;
};


export const getModelContextSize = (modelName) => {
    switch (getModelNameForTiktoken(modelName)) {
        case "gpt-3.5-turbo-16k":
            return 16384;
        case "gpt-3.5-turbo":
            return 4096;
        case "gpt-4-32k":
            return 32768;
        case "gpt-4":
            return 8192;
        case "gpt-4o":
            return 128000;
        default:
            return 4096;
    }
};

export const importTiktoken = async () => {
    try {
        const { encoding_for_model } = await import("@dqbd/tiktoken");
        return { encoding_for_model };
    } catch (error) {
        console.log(error);
        return { encoding_for_model: null };
    }
};

export const calculateMaxTokens = async ({ prompt, modelName }) => {
    const { encoding_for_model } = await importTiktoken();
    let numTokens;

    try {
        if (encoding_for_model) {
            const encoding = encoding_for_model(getModelNameForTiktoken(modelName));
            const tokenized = encoding.encode(prompt);
            numTokens = tokenized.length;
            encoding.free();
        } else {
            console.warn("tiktoken is not available, falling back to approximate token count");

            numTokens = Math.ceil(prompt.length / 4);
        }
    } catch (error) {
        console.warn("Failed to calculate number of tokens with tiktoken, falling back to approximate count", error);

        numTokens = Math.ceil(prompt.length / 4);
    }

    const maxTokens = getModelContextSize(modelName);
    return maxTokens - numTokens;
};
