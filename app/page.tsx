import Image from 'next/image';

export default function Home() {
  return (
    <main
      className="bg-gray-100 h-screen flex items-center justify-center p-5 sm:bg-red-100 md:bg-green-100
     lg:bg-cyan-100 xl:bg-orange-100 2xl:bg-purple-100"
    >
      <div className="bg-white w-full shadow-lg p-5 rounded-3xl max-w-screen-sm flex flex-col gap-4">
        <input></input>
        <button className="w-full bg-[#543cb8] text-white rounded-sexy-name h-10 m-tomato">
          Submit
        </button>
      </div>
    </main>
  );
}
