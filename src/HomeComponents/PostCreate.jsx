import React, { useRef, useState } from "react";

const PostCreate = ({ setCreationTab, setCreateModal }) => {
  const [files, setFiles] = useState([]);
  const [fileError , setFileError] = useState("")

  const [tagOpen, setTagOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState("public");

  const [taggedUsers, setTaggedUsers] = useState([]);

  const [caption, setCaption] = useState("");
  const MAX_FILES = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fileRef = useRef(null)

  const handleCaption = (e)=>{
    if(e.target.value.length<=1000){
        setCaption(e.target.value)
    }
}


const handleFiles = (newFiles)=>{
    setFileError("")
    if(files.length>20){
        setFileError("already 20 files are selected")
        return;
    }
    const incomingFiles = Array.from(newFiles);
    let media = [...files, ...incomingFiles]
    let toatalFileSize = media.reduce((acc,file)=>acc+file.size,0)

    if(toatalFileSize > MAX_FILE_SIZE){
        setFileError("Total image and video size should be under 10MB")
        return;
    }

    if(media.length > MAX_FILES){
        media = media.slice(0,MAX_FILES)
    }

    media = media.map(file=> ({
        file,
        type:file.type.startsWith('image')?"image":"video",
        url:URL.createObjectURL(file),
        size:file.size,
    }))

    setFiles(media)

} 

const removeFile = (fileIndex)=>{
    setFiles(prev=>{
        prev.filter((file,i)=>i!==fileIndex)
    })
}


  return (
    <div className=" fixed max-w-screen min-h-screen inset-0 z-100 bg-black/40 flex items-center justify-center">
      <div className="w-1/2 p-4 flex flex-col items-center justify-center gap-4 bg-white">
        {/* headers */}
        <div className="w-full flex items-center justify-start gap-2 ">
          <i className="bx bx-image-plus text-3xl text-red-500 "></i>
          <p className="text-xl text-red-500 leckerli">Create Postt</p>
        </div>

        {/* caption */}
        <div className="flex flex-col items-center w-full justify-center gap-2 ">
            <div className="w-full flex items-center justify-between ">
                <h3 className="text-xl text-black"> Caption</h3>
                <p className=" text-sm text-black font-semibold ">
                {           caption.length}/1000 characters
                </p>
            </div>
          
          <div className="w-full h-100 relative">
            <textarea
              className="resize-none  bg-[#fff] rounded-3xl border-1 border-[#878a8b]/50 shadow-lg px-2 pt-3 pb-10 placeholder:text-lg   w-full  h-full focus:outline-none"
              value={caption}
              onChange={handleCaption}
              placeholder="write caption for your post"
            />
            
          </div>
        </div>




        {/* photos and videos */}
        <div className="w-full flex flex-col items-center justify-center gap-2">

            {/* headers */}
            <div className="w-full flex items-center justify-start ">
                <h3 className="text-xl text-black"> Photos & Videos</h3>
            </div>

                {/* select files */}
            <div className="h-100 border-dashed border-gray-500 hover:border-red-500 border-2 rounded-2xl flex flex-col items-center justify-center p-4 gap-3 " 
            onClick={(e)=>{
                e.stopPropagation();
                fileRef.current.click()
            }}
            >
                <i className='bx  bx-arrow-out-up-square-half text-gray-500 text-6xl' ></i>
                <h3 className="text-black text-2xl "> Click to add multiple Photos & Videos</h3> 
                <p className="text-gray-600 text-sm">Maximum 20 files are allowed</p>
                <p className="text-gray-600 text-sm">Total file size should be less than or equal to 10 MB</p>



                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4"
                    className="hidden"
                    onChange={handleFiles}
                    ref={fileRef}
                    />

            </div>

            {
                fileError && <h3 className="text-red-500 text-xl font-semibold">{fileError}</h3>
            }


                {/*  chosen images and videos */}


                <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                {
                files.map((file, ind)=>{
                    

                   return (
                   <div className= "relative w-full overflow-hidden "
                   key={ind}
                   >
                        
                       

                        {
                            file.type==="image"?
                            <img 
                            src={file.url}
                            className='object-cover w-full rounded-lg '
                            />
                            :
                            <video
                            src={file.url}
                            
                            className='object-cover w-full rounded-lg'
                            />
                        }
                        
                        <i className="bx bx-x p-1.5 text-2xl text-white bg-red-500 rounded-full absolute top-0 right-0"
                        onClick={(e)=>{
                            e.stopPropagation()
                            removeFile(ind)
                        }}
                        ></i>
                        

                    </div>)
                })
            }

                </div>



        </div>


        {/* set Visibility  */}

















      </div>
    </div>
  );
};

export default PostCreate;
