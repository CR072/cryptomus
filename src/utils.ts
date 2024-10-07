import crypto from 'crypto';

function generateSignature(data: Record<string, any>, apiKey: string): string {
    return crypto.createHash('md5').update(Buffer.from(JSON.stringify(data)).toString('base64') + apiKey).digest('hex');
}

function verifySignature(body: Record<string, any>, signature: string, apiKey: string): boolean {
    const computedSignature = generateSignature(body, apiKey);
    return computedSignature === signature;
}

export { generateSignature, verifySignature };