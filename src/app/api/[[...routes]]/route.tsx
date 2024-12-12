/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { Button, Frog, parseEther, TextInput } from 'frog'
import { handle } from 'frog/next'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { Box, Text, VStack, vars , Image} from '@/lib/frogui'
import { ABI } from '@/lib/contractABIs/abi'
import web3 from 'web3';
const infuraUrl = `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`;
const degenUrl = 'https://rpc.degen.tips';

type State ={
  bountyTitle: string;
  bountyDescription: string;
  chain: string;
  reward: number;
}
const app = new Frog<{State:State}>({
    basePath: '/api',
    title: 'Frog Frame',
    browserLocation: '/',
    ui: {vars},
    assetsPath: '/',
    initialState: {
        bountyTitle: '',
        bountyDescription: '',
        chain: '',
        reward: 0,
    }
})

app.frame('/', (c) => {
    
    const {deriveState} = c;
    deriveState(previousState=>{
      previousState.bountyTitle = '';
      previousState.bountyDescription = '';
    })
    return c.res({
        image: (
            <Box
        grow
        alignHorizontal="center"
        alignVertical='center'
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4" width={'100%'} justifyContent='center' alignItems='center' >
          
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src='/favicon.png' width={"128"} height={'128'}  objectFit='contain' borderRadius={'10'} />
          
          <Text color="text" size="32" font={'madimi'}>
            Welcome to PoidhAI!
          </Text>
          <Text color="text" size="24" font={'madimi'}>
            Generate Bounty Ideas with AI on poidh.
          </Text>
        </VStack>
      </Box>
),
title:'PoidhAI',
    intents: [
      <TextInput placeholder='Enter you bounty idea' />,
      <Button value='generate' action='/generate'>Generate Bounty</Button> 
    ]
  })
})

app.frame('/generate', async (c) => {
  const {deriveState, inputText} = c;
  console.log("input",inputText);
  const state = await deriveState(async (previousState) => {
    const response = await  fetch(`${process.env.FRONTEND_URL}/api/generateBounty`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hint:inputText }),
    });
    console.log(response);
    if (!response.ok) {
        previousState.bountyTitle = 'Failed';
        previousState.bountyDescription = '';
    }else{
    const data = await response.json();
    previousState.bountyTitle =  data.generatedBounty.title;
    previousState.bountyDescription = data.generatedBounty.description;
    }
  })
  if(state.bountyTitle === 'Failed'){
    return c.error({message: 'Failed to generate bounty'});
  }
  console.log(state)
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical='center'
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4" width={'100%'} justifyContent='center' alignItems='center' >
          <Text color="text" size="32" font={'madimi'}>
            Title: {state.bountyTitle}
          </Text>
          <Text color="text" size="24" font={'madimi'}>
            Description: {state.bountyDescription}
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <Button value='degen' action='/chain/degen'>Degen</Button>,
      <Button value='base' action='/chain/base'>Base</Button>,
      <Button value='arbitrum' action='/chain/arbitum'>Arbitrum</Button>,
    ]
  })
});

app.frame('/chain/:chain', (c) => {
  const {deriveState} = c;
  const state = deriveState( (previousState) => {
    previousState.chain = c.req.param('chain');
  })

  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical='center'
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4" width={'100%'} justifyContent='center' alignItems='center' >
          <Text color="text" size="32" font={'madimi'}>
            Title: {state.bountyTitle}
          </Text>
          <Text color="text" size="24" font={'madimi'}>
            Description: {state.bountyDescription}
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <TextInput placeholder={`Enter reward amount in ${state.chain === 'degen' ? 'degen' : 'ETH'} `} />,
      <Button value='create' action='/create'>Create Bounty</Button>
    ]
  })
})

app.frame('/create', (c) => {
  const {deriveState, inputText} = c;
  let reward;
  try{
    if(!inputText){
      return c.error({message: 'Please enter reward amount'});
    }
    reward = parseInt(inputText);
  }catch(e){
    console.log(e);
    return c.error({message: 'Please enter valid reward amount'});
  }
  const state = deriveState((previousState) => {
    previousState.reward = reward;
  })
  
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical='center'
        backgroundColor="background"
        padding="32"
      >
        <VStack gap="4" width={'100%'} justifyContent='center' alignItems='center' >
          <Text color="text" size="24" font={'madimi'}>
            Title: {state.bountyTitle}
          </Text>
          <Text color="text" size="20" font={'madimi'}>
            Description: {state.bountyDescription}
          </Text>
          <Text color="text" size="20" font={'madimi'} align='left'>
            Reward: {state.reward} {state.chain === 'degen' ? 'degen' : 'ETH'}
          </Text>
        </VStack>
      </Box>
    ),
    action: '/finish',
    intents: [
      <Button.Transaction target={`/send`}>Create Bounty</Button.Transaction>
    ]
  })

})

app.transaction('/send', (c)=>{
  const {previousState} = c;
  const chain = previousState.chain === 'degen' ? 'eip155:666666666' : previousState.chain === 'base' ? "eip155:8453" : "eip155:42161";
  const contractAddress =  previousState.chain === 'degen' ? '0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814' : previousState.chain === 'base' ? "0xb502c5856F7244DccDd0264A541Cc25675353D39" : "0x0Aa50ce0d724cc28f8F7aF4630c32377B4d5c27d";
  return c.contract({
    abi: ABI,
    chainId: chain,
    to: contractAddress,
    functionName: 'createSoloBounty',
    value: previousState.chain === 'degen' ? BigInt( previousState.reward.toString() + "000000000000000000") : parseEther(previousState.reward.toString()),
    args: [previousState.bountyTitle, previousState.bountyDescription],
  })
})


app.frame('/finish', async (c) => {
  const {previousState} = c;
  let web3Instance;
  if(previousState.chain === 'degen'){
    web3Instance = new web3(new web3.providers.HttpProvider(degenUrl));
  }else{
    web3Instance = new web3(new web3.providers.HttpProvider(infuraUrl));
  }
  const contractAddress =  previousState.chain === 'degen' ? '0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814' : previousState.chain === 'base' ? "0xb502c5856F7244DccDd0264A541Cc25675353D39" : "0x0Aa50ce0d724cc28f8F7aF4630c32377B4d5c27d";
  const contract = new web3Instance.eth.Contract(ABI, contractAddress);
  const res = await contract.methods.bountyCounter().call();
  console.log(res);
  return c.res({
    image: (
      <Box
        grow
        alignHorizontal="center"
        alignVertical='center'
        backgroundColor="background"
        padding="32">
        <VStack gap="4" width={'100%'} justifyContent='center' alignItems='center'>
          <Text color="text" size="32" font={'madimi'}>
           Bounty created successfully
          </Text>
          </VStack>
          </Box>
    ),
    intents:[
      <Button.Redirect location={`https://poidh.xyz/${previousState.chain}/bounty/${res}`}>Checkout Bounty</Button.Redirect>
    ]
  })
})

devtools(app, { serveStatic })
export const GET = handle(app)
export const POST = handle(app)