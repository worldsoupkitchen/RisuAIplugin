//@risu-name ReverseProxy

//@risu-arg __ReverseProxy string
//@risu-arg _API string
//@risu-arg __model string

addProvider('ReverseProxy', async (arg) => {
    const apikey = await getArg("ReverseProxy::_API");
    let ReverseProxy = await getArg("ReverseProxy::__ReverseProxy");
    const modelname = await getArg("ReverseProxy::__Model");

    if (ReverseProxy.endsWith('v1')) {
        ReverseProxy += '/chat/completions';
    } else if (ReverseProxy.startsWith('http') && !ReverseProxy.endsWith('/chat/completions')) {
        ReverseProxy = ReverseProxy.replace(/\/?$/, '/v1/chat/completions');
    }

    const body = {
        model: `${modelname}`,
        messages: arg.prompt_chat,
        temperature: arg.temperature,
        max_tokens: arg.max_tokens,
        presence_penalty: arg.presence_penalty,
        frequency_penalty: arg.frequency_penalty,
        logit_bias: arg.bias,
    };

    const response = await risuFetch(ReverseProxy, {
        rawResponse: true,
        body: body,
        headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${apikey}`,
        }
    });

    try {
        const json = new TextDecoder("utf-8").decode(response.data);
        const obj = JSON.parse(json);

        if (!response.ok) {
            return {
                success: false,
                content: `Error: ${obj}`
            };
        }

        const contentMessage = obj.choices && obj.choices[0] && obj.choices[0].message && obj.choices[0].message.content ? obj.choices[0].message.content : "No content available";

        return {
            success: response.ok,
            content: contentMessage
        };
    } catch (error) {
        return {
            success: false,
            content: `Error: ${error}`
        };
    }
});
