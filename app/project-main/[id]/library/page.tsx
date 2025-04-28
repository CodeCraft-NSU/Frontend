import MainHeader from "@/app/components/MainHeader";
import MainSide from "@/app/components/MainSide";
import libraryList from "@/app/json/library.json";
import LibraryTable from "@/app/components/LibraryTable";

export default function LibraryPage({
  params,
  searchParams,
}: {
  params: { id: number };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10);
  const data = libraryList.list;
  const itemsPerPage = 10;
  const currentData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "'Pretendard', 'sans-serif'",
        backgroundColor: "#f3f4f6",
        overflow: "visible",
      }}
    >
      <MainHeader pid={params.id} />

      <div style={{ display: "flex", flex: 1,}}>
        <MainSide pid={params.id} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: 'column',
            margin: "30px 40px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            padding: "40px 50px",
            overflow: 'hidden'
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: "#22c55e",
              marginBottom: "20px",
              borderBottom: "2px solid #22c55e",
              paddingBottom: "10px",
            }}
          >
            📁 자료실
          </h1>

          <div
            style={{
              backgroundColor: "#f1f5f9",
              padding: "18px 20px",
              borderRadius: "10px",
              color: "#475569",
              fontSize: "16px",
              marginBottom: "30px",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            제공된 자료를 다운로드하여 자유롭게 사용할 수 있습니다.
          </div>
          <div style={{flex: 1, overflow: 'auto'}}>
            <LibraryTable pid={params.id} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
