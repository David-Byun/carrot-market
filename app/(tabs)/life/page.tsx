async function getPosts() {
  await new Promise((r) => setTimeout(r, 100000));
}

export default async function Life() {
  const posts = await getPosts();
  return (
    <div>
      <h1 className="text-white text-4xl">Life!</h1>
    </div>
  );
}
