'use client'

const LibraryDownloadBtn = ({link}: {link: string}) => {
    const tmpLink = link
    const handleClick = () => {
        console.log(link)
        try{
            const fileUrl = `/library/${tmpLink}`;
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = tmpLink
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }catch(err){}
    }
    return(
        <button 
        onClick={() => handleClick()}
        style={{
            backgroundColor: "#22c55e",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            textDecoration: "none",
            display: "inline-block",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#16a34a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#22c55e")
          }
        >
            다운로드
        </button>
    )
}

export default LibraryDownloadBtn;