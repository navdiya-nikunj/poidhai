"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import generateBounty from "@/lib/generaeBounty"
import { Switch } from "@/components/ui/switch"
import { useAccount,  useWriteContract } from "wagmi"
import { ABI } from "@/lib/contractABIs/abi"
import { config } from "@/config"
import { Address, parseEther } from "viem"
import toast from "react-hot-toast"
import { Loader } from "lucide-react"
import { arbitrum, base, degen } from 'wagmi/chains'
import {  readContract } from '@wagmi/core'
import { getNetworkNameForFrame, getNetworkNameForPoidh } from "@/lib/utils"

interface Bounty {
  id: number,
  title: string
  description: string
  network: number
}

export default function BountyGenerator() {
  const [hint, setHint] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [bounty, setBounty] = useState<{ title: string; description: string } | null>(null)
  const [blockchain, setBlockchain] = useState<"base" | "degen" | "arbitrum" | "">("")
  const [amount, setAmount] = useState("")
  const [isSoloBounty, setIsSoloBounty] = useState<boolean>(false);
  const {writeContractAsync} = useWriteContract({
    config: config
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedBounty, setGeneratedBounty] = useState<Bounty | null>(null)
  const {address}  = useAccount();
  
  const handleGenerateBounty = async  () => {
    setGeneratedBounty(null);
    setAmount("");
    try{
      setIsGenerating(true);
      const generatedBounty = await  generateBounty(hint, category, difficulty)
      setIsGenerating(false);
      setBounty(generatedBounty)
    }catch(error: any){
      console.log(error)
      setIsGenerating(false);
      toast.error(error.message.slice(0, 100));
    }
  }

  const Bounty = async (title: string, description: string, amount: string, isSoloBounty: boolean, chainId: number, contracAddress : Address) => {
    try{
      setIsCreating(true);
       await writeContractAsync({
        abi: ABI,
        address: contracAddress,
        functionName: isSoloBounty ? 'createSoloBounty' : 'createOpenBounty',
        args: [ title, description],
        value: chainId === degen.id ? BigInt(amount+ "000000000000000000") : parseEther(amount),
        chainId: chainId,
      })
      const bounty = await readContract(config,{
        abi: ABI,
        address: contracAddress,
        functionName: 'getBountiesByUser',
        chainId: chainId,
        args: [address, 0 ]
      })  as Array<{
  id: bigint;
  name: string;
  description: string;
}>;
      if(bounty.length <= 10){
        let b = 0;
        for(let i = 0; i < 10; i++){
          if(bounty[i].id !== BigInt(0)){
            b = i;
          }
        }
        const bo : Bounty = {
          id: Number(bounty[b].id),
          title: bounty[b].name,
          description: bounty[b].description,
          network: chainId
        }
        setGeneratedBounty(bo)
      }else{
        const bo : Bounty = {
          id: Number(bounty[bounty.length - 1].id),
          title: bounty[bounty.length - 1].name,
          description: bounty[bounty.length - 1].description,
          network: chainId
        }
        setGeneratedBounty(bo)
      }
      setIsCreating(false);
    } catch (error: any) {
      console.error(error);
      setIsCreating(false);
      if(error.message.includes("Connector not connected")) {
       toast.error("Please connect your wallet");
      }
      else{
        toast.error(error.message.slice(0, 100));
      }
    }
  }



  const handleCreateBounty = async() => {
    const chainId = blockchain === "base" ? base.id : blockchain === "degen" ? degen.id : blockchain === "arbitrum" ? arbitrum.id : 0;
    const contracAddress = blockchain === "base" ? "0xb502c5856F7244DccDd0264A541Cc25675353D39" : blockchain === "degen" ? "0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814" : blockchain === "arbitrum" ? "0x0Aa50ce0d724cc28f8F7aF4630c32377B4d5c27d" : "";
   try{
    if(chainId === 0 || !chainId || !contracAddress){
      console.error("Invalid chain");
    }else{
      await Bounty(bounty?.title || "", bounty?.description || "", amount, isSoloBounty, chainId, contracAddress);
    }

   }catch(error){
    console.error(error);
   }
    
  }

  return (
    <div className="min-h-screen flex justify-center min-w-screen items-center w-full bg-gradient-to-br from-purple-100 to-indigo-200">
  
      <main className="flex min-w-screen items-center justify-center p-4 w-full">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg lg:text-2xl font-bold text-center text-purple-800">Bounty Ideas Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-1">
                Enter your bounty hint
              </label>
              <Input
                id="hint"
                placeholder="e.g., Develop a decentralized social media platform"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2  ml-0 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select onValueChange={setCategory} >
                  <SelectTrigger id="category" className="m-0 ">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Devlopment">Programming/Devlopment</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="memes">Memes</SelectItem>
                    <SelectItem value="recommendations">Recommendations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <Select onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="m-0 ">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="moderate">moderate</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleGenerateBounty} 
              className="m-0 w-full bg-purple-600 hover:bg-purple-700"
              disabled={!hint || isGenerating}
            >
              {isGenerating ? <Loader/> : "Generate Bounty"}
            </Button>
            {bounty && !generatedBounty && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-800">Title: {bounty.title}</h3>
                <Textarea 
                  value={bounty.description} 
                  onChange={(e) => setBounty({ ...bounty, description: e.target.value })}
                  className="w-full h-32 resize-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2   gap-4">
                  <div>
                    <label htmlFor="blockchain" className="block text-sm font-medium text-gray-700 mb-1">
                      Choose Blockchain
                    </label>
                    <Select onValueChange={(value: "base" | "degen") => setBlockchain(value)}>
                      <SelectTrigger id="blockchain" className="m-0">
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="degen">Degen</SelectItem>
                        <SelectItem value="arbitrum">arbitrum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Bounty Amount ({blockchain === "base" || blockchain === 'arbitrum' ? "ETH" : "DEGEN"})
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                  <div  className="flex items-center font-medium text-gray-700 ">
                    Solo Bounty: 
                  <Switch
                  className="ml-1"
                  checked={isSoloBounty}
                  onCheckedChange={(checked) => setIsSoloBounty(checked)}
                  
                  />
                 
                  <div className="flex items-center space-x-2">
                    {
                      isSoloBounty ? "(you are the sole bounty contributor)" : "(users can add additional funds to your bounty)"
                    }
                  </div>
                </div>
                <Button 
              onClick={handleCreateBounty} 
              className="w-full bg-green-600 hover:bg-green-700 m-0"
              disabled={!bounty || !blockchain || !amount || isCreating}
            >
              {isCreating ? <Loader/> : "Create Bounty"}
            </Button>
              </div>
            )}
            {
              generatedBounty && (
                <div className="bg-green-100 p-4 text-green-800 rounded">
                  <h3 className="text-lg font-semibold">Bounty Created Successfully</h3>
                  <p className="text-sm">Bounty ID: {generatedBounty.id}</p>
                  <p className="text-sm">Network: {generatedBounty.network}</p>
                  <p className="text-sm">Bounty Title: {generatedBounty.title}</p>
                  <p className="text-sm">Bounty Description: {generatedBounty.description}</p>
                  {/* // view on poidh ounty page */}
                  <div className="flex mt-2 flex-col sm:flex-row m-0  justify-start items-center space-x-2">

                  <Button 
                  onClick={() => {
                    const url = `https://poidh.xyz/${getNetworkNameForPoidh(Number(generatedBounty.network))}/bounty/${generatedBounty.id}`;
                    window.open(url, '_blank');}}
                   className="bg-black text-white font-medium m-0 mb-2 sm:mb-0 rounded ">View Bounty on poidh</Button>
                 

                    <Button
                  className="bg-purple-500 text-white font-medium m-0 rounded"
                onClick={() => {
                    const url = `https://warpcast.com/~/compose?text=I+just+created+a+bounty+on+poidh.xyz%21+Check+it+out%3A+https%3A%2F%2Fpoidh-frame-test.vercel.app%2Fapi%2Fbounty%2F${getNetworkNameForFrame(generatedBounty.network)}%2F${generatedBounty.id}`;
                    window.open(url, '_blank');}}>
                    Share on Farcaster
                    </Button>
                  </div>
                   
                </div>
              )
            }
          </CardContent>
       
        </Card>
      </main>
    </div>
  )
}

