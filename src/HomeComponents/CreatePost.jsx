import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import PostCreation from './PostCreation'
import TripCreation from './TripCreation'

const CreatePost = ({createModal, setCreateModal}) => {
    const textRef = useRef("")
    const timerRef = useRef(null)
    const [creationTab, setCreationTab] = useState("Trip")
    


    const reduxAvatar = useSelector(state=>state.user.avatar)
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    const userAvatar=userInfo.avatar;
    const avatar = reduxAvatar || userAvatar;
    const createText = ["share your travel journey", "make trip, and collaborate with your friends", "control who can see your posts and trips", "create memories , make friends"]
    let maxChar =0;
     createText.forEach((text)=>{
        maxChar = Math.max(maxChar, text.length)
     })

    //  tyoe effect
     useEffect(() => {
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
    
        function typeEffect() {
          const currentText = createText[textIndex];
          const display = textRef.current;
    
          
    
          if (isDeleting) {
            // Deleting text
            display.innerText = currentText.substring(0, charIndex - 1);
            charIndex--;
          } else {
            // Typing text
            display.innerText = currentText.substring(0, charIndex + 1);
            charIndex++;
          }
    
          // Speed control
          let typeSpeed = isDeleting ? 5 : 100;
    
          if (!isDeleting && charIndex === currentText.length) {
            // Pause before deleting
            typeSpeed = 1500;
            isDeleting = true;
          } else if (isDeleting && charIndex === 0) {
            // Move to next text
            isDeleting = false;
            textIndex = (textIndex + 1) % createText.length;
          }
    
          timerRef.current = setTimeout(typeEffect, typeSpeed);
        }
    
        typeEffect();
    
        return () => clearTimeout(timerRef.current);
      }, []);

    

  return (
    <div className='w-[70%] lg:h-[70px] flex justify-center overflow-x-hidden mt-5  '>
         <div className="w-full h-full bg-[#fff] rounded-xl shadow-xl     flex items-center justify-center  gap-4 transition-all duration-300   cursor-pointer" 
          onClick={(e)=>{
            e.stopPropagation()
            setCreateModal(true)
          }}
          >
        
      
            <div className=" w-full h-full  flex justify-between items-center  px-4 py-2">
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="h-2/3 rounded-full object-contain"
                />

                  <div className="w-[90%] h-full  text-lg  rounded-xl  text-[#000]/50 flex items-center border px-2 shadow-2xl  "
                  ref={textRef}
                  ></div>

              
              </div>

      

      
        </div>

        { createModal &&  
      <div className='w-full h-[calc(100vh-80px)] bg-[#000]/80 absolute left-[50%] -translate-x-[50%]'>

        <div className='w-[70%] h-1/2 bg-white absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] rounded-2xl flex flex-col items-center justify-center gap-5'>

        <i className='bx  bx-x text-3xl absolute cursor-pointer right-10 top-5'  
        onClick={()=>{
          setCreationTab("")
          setCreateModal(false)
        }}
        ></i>

        <div className=' leckerli w-1/2 h-16 rounded-full text-center leading-[4rem] bg-red-400 text-3xl text-white cursor-pointer'
        
        onClick={()=>{
          setCreateModal(false)  
          setCreationTab("Post")
        }}

        > Create a post </div>

        <div className=' leckerli w-1/2 h-16 rounded-full text-center leading-[4rem] bg-red-400 text-3xl text-white cursor-pointer'

        onClick={()=>{
          setCreateModal(false)  
          setCreationTab("Trip")
        }}
        
        > Create Trip</div>


        </div>


      </div>}


        {creationTab==="Post" ?
         <PostCreation setCreationTab={setCreationTab} setCreateModal={setCreateModal}/> : creationTab==="Trip"? <TripCreation setCreationTab={setCreationTab} />:""
        }

    </div>
   
  );
}

export default CreatePost 
//   <i className='bx  bx-image text-[#ffffff]' ></i> 
//       <i class='bx  bx-video text-[#ffffff]' ></i> 
//       <i class='bx  bx-trip text-[#ffffff]' ></i>     
//       <i class='bx  bx-price-tag text-[#ffffff]'></i> 
//       <i class='bx  bx-send text-[#ffffff]'></i>   