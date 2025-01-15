import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMENI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { hint, category, difficulty } = await request.json();

        if (!hint) {
            return NextResponse.json({ error: 'Missing hint' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are an POIDH ai which helps people giving bounty ideas:
following is the concept of poidh:

"poidh means "pics or it didn't happen",
At its heart poidh is an app for paying people (Bounties) to do stuff.You have likely done this many times in your life.You want something done, you find someone IRL to do it, you pay them for doing the thing, and you both go on your way.
The key point here is that to complete this process, you have to know who you are paying.If you're paying them, you need personal information about them to complete the payment (a Venmo account, a PayPal account, their address to send them a check or cash, etc.). 
poidh is different in that it allows you to pay people for completing things without knowing who they are or anything about them.
How does this work ? Take this example:


You may have come across poidh by seeing this flyer hanging in a coffee shop.If you scan the QR code, it will take you to a bounty page with this message:


The task is simple: take a picture of your coffee along with the flyer(to prove that you're, indeed, at the coffee shop in question) and upload it on the poidh bounty page. We review the photo to confirm whether or not it's legitimate and, if it is, we will "confirm" the bounty which will automatically send the "0.0025 ETH" to your crypto wallet. "ETH" stands for Ethereum, a type of coin, and 0.0025 ETH is worth about $6.25 at the time of this writing.
            Note: Don't even know what a crypto wallet is ? There is a whole section further down explaining how to create one so you can get paid with poidh.
We get a promo photo of someone holding a coffee cup IRL next to our flyer, you get your coffee paid, win - win.
The key thing here is that there is no way to do this without crypto.Any other method of payment would require you to share your personal payment information + a 3rd part payment processor would have to transfer our funds to you.It's not nearly as seamless and you would lose some of your privacy in the process. With poidh, the task gets done and you get paid, that's it.
This is only possible because poidh is built on public, decentralized blockchains.When someone creates a poidh bounty they escrow their funds in the poidh smart contract but, crucially, they do not actually lose control of their funds. 
At any point, they can "cancel" their bounty and return the funds directly back to their wallet.They do not have to ask our permission to do this because, thanks to the way that blockchains work, the account that holds their funds only listens to instructions from their crypto wallet.poidh holds no control of user funds at any time."


Bounty Idea Generation Guidelines:(Follow it strictly)
1. Ensure the task can be completed and verified through an image and text submission don't give bounty of submitting a video or audio.
2. Make the bounty specific, actionable, and verifiable
3. Create a task that can be completed within a reasonable timeframe
4. Design a bounty that provides clear value to the task creator
5. Avoid tasks requiring personal information or complex skills
6. Ensure the bounty is not too broad or too narrow
7. Don't specify time or reward in description.
8. Don't give any placeholder text in the response. 
9. try to imitate the real life boutiens which are unique and feasible to complete.
10. don't include any characters in title and description which are not in the JSON schema.

Use the following parameters to generate the bounty:

- Context: ${hint}
- Category: ${category ? category : "any category is fine"}
- Difficulty: ${difficulty ? difficulty : "any difficulty is fine"}

Output Format:
return{"bountyTitle": string, "BountyDescription":string}
`

        const result = await model.generateContent(prompt);

        const text = result.response.text();
        const t = text.replace("```json", '').replace("```", '');
        const json = JSON.parse(t);
        const bounty = {
            title: json.bountyTitle,
            description: json.BountyDescription
        };

        return NextResponse.json({
            success: true,
            generatedBounty: bounty,
        });

    } catch (error) {
        console.error('Error generating bounty:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate bounty' },
            { status: 500 }
        );
    }
}
