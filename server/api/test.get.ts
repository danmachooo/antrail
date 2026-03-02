import { getLLMService } from "../services/llm/index.service"

export default defineEventHandler(async event => {
    

    const llm = getLLMService();

    const prompt = "Say hello";

    const response = llm.generateJSON(prompt);

    return {
        response
    }
})