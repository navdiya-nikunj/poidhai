"use client"

import Image from "next/image";
import { useAccount } from "wagmi"

export function Header() {
    const {isConnected } = useAccount();
    
  return (
    <>    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Image src={'/logo.png'} alt="PoidhAIBounties" width={50} height={50} />
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-purple-800">PoidhAIBounties</h1>
          </div>
         
            <div className=" hidden md:flex">
               <appkit-button size="sm"/>
            {
                isConnected && <appkit-network-button />
            } 
              </div>
         
         
        </div>
      </div>
            
    </header>
    <div className="md:hidden flex justify-between p-2 items-center">

             <appkit-button size="sm"/>
            {
                isConnected && <appkit-network-button/>
            }     
            </div>
            </>

  )
}

