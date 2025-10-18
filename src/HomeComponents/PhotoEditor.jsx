import React, { useRef, useState } from 'react'

const PhotoEditor = ({files,setFiles}) => {
    const [activeImageIndex , setActiveImageIndex] = useState(0)
    const previewImage = files[activeImageIndex];
    
    const addMoreRef = useRef()

    const moveImage= (index, type)=>{
        setFiles(prev=>{
            const mediaFiles=[...prev];
            const itemToBeRemovedArr= mediaFiles.splice(index,1)
            if(type==="right" && index < files.length-1){
                mediaFiles.splice(index+1,0,itemToBeRemovedArr[0])
            }else if(type==="left" && index >0){
                mediaFiles.splice(index-1,0,itemToBeRemovedArr[0])
            }
            return mediaFiles;
        })
    }

    const handleMediaDelete= ()=>{
        const imageIndex=activeImageIndex
        setFiles(files.filter((file,ind)=>{
            if(ind===activeImageIndex){
                return false;
            }
            else{
                return true;
            }
        }))
        if(imageIndex===files.length-1){
            setActiveImageIndex(imageIndex-1)
        }else{
            setActiveImageIndex(imageIndex)
        }
        
    }

    const handleAddMore = (newFiles)=>{
        // if already 20 files exist return
        if(files.length>=20)return;
        const MAX_FILE_SIZE=100*1024*1024;
        const incomingFiles = Array.from(newFiles)
        if(incomingFiles.length===0)return;


        let alreadyFileSize= files.reduce((acc,file)=>acc+file.size,0)

        // if already files are = 100 MB return
        if(alreadyFileSize >= MAX_FILE_SIZE)return;

        

        let newFileSize = incomingFiles.reduce((acc,file)=>acc+file.size,0)

        // if new+old file size are greater than 100MB  return
        if(newFileSize+alreadyFileSize>MAX_FILE_SIZE)return

        let media=[...files]

        incomingFiles.forEach((file)=>{
            if(media.length <20){
                media.push({
                    type:file.type.startsWith('image')?"image":"video",
                    url:URL.createObjectURL(file),
                    size:file.size,
                })
            }
        })
        setFiles([...media]);
    }
  return (
    <div className=' w-full h-[calc(100vh-80px)] bg-[#FFF] flex justify-around items-center gap-5 px-5'>
        {/* image previewer */}
        <div className='w-[50%] h-[50%] '> 
                {
                previewImage.type==="image"?
                <img
                src={previewImage.url}
                className='object-contain w-full h-full border-4 border-[#000]'
                />:
                <video
                src={previewImage.url}
                controls
                className='object-contain w-full h-full'
                />
                
                }
        </div>

        {/* image lists */}
        <div className='w-[45%] h-[70%] flex items-center justify-center flex-wrap gap-2 overflow-x-hidden overflow-y-auto'>
            <p className='absolute top-10 right-[40%] text-[#EF233C] text-lg'>{activeImageIndex+1} of {files.length}</p>
            {
                files.map((file, ind)=>{
                    

                   return (
                   <div className={`w-[40%] h-[200px] overflow-hidden relative ${ind===activeImageIndex ?"border-4 border-[#000]":"border-1 "}` }
                    key={ind}
                    onClick={()=>setActiveImageIndex(ind)}
                    >
                        <button
                        onClick={(e)=>{
                            e.stopPropagation()
                            moveImage(ind, "right")}
                        }
                        disabled={ind===files.length-1}>
                                <i className='bx  bx-arrow-right-stroke-circle absolute top-1/2 right-0 text-3xl text-white bg-[#EF233C]  hover:bg-[#EF233C]/40 cursor-pointer'
                                
                                ></i> 
                        </button>
                       

                        {
                            file.type==="image"?
                            <img 
                            src={file.url}
                            className='object-cover w-full h-full '
                            />:
                            <video
                            src={file.url}
                            
                            className='object-contain w-full h-full '
                            />
                        }
                        
                        <button
                        onClick={(e)=>{
                            e.stopPropagation()
                            moveImage(ind, "left")
                        }}
                        disabled={ind===0}>
                                <i className='bx  bx-arrow-left-stroke-circle absolute top-1/2 left-0 text-3xl   text-white bg-[#EF233C]  hover:bg-[#EF233C]/70 cursor-pointer'
                                
                                ></i> 
                        </button>

                    </div>)
                })
            }

        </div>

        <div className='flex items-center justify-between absolute bottom-0 w-full h-[100px]'>

           <div className='flex items-center justify-center gap-10 w-1/2'>
                    <button 
                    className='relative group cursor-pointer flex items-center justify-center rounded-full '
                    onClick={(e)=>{
                        e.stopPropagation();
                        addMoreRef.current.click()
                    }}
                    >
                        <i className='bx  bx-plus-circle text-3xl'></i> 
                        <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap'>Add photos or videos</span>
                    </button>
<input
className='hidden'
type='file'
multiple
accept='image/* , video/mp4'
ref={addMoreRef}
onChange={(e)=>{
    handleAddMore(e.target.files)
}}

/>
                    <button
                    className='relative group cursor-pointer flex items-center justify-center rounded-full '
                    onClick={(e)=>{
                        e.stopPropagation()
                        handleMediaDelete()
                    }}
                    >
                    <i className='bx  bx-trash text-3xl'></i> 
                    <span className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
                   bg-black text-white text-sm px-2 py-1 rounded 
                   opacity-0 group-hover:opacity-100 
                   transition-opacity duration-300 whitespace-nowrap'>Delete selected media</span>
                    </button>

           </div>


           <div className={`w-[80px] h-[50px] rounded-full bg-green-500 hover:bg-green-400  text-white flex items-center justify-center mr-10 `}> 

                <p>Next</p>
           </div>

           
        </div>
    </div>
  )
}

export default PhotoEditor