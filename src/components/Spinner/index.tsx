const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-transparent bg-opacity-30 backdrop-blur-md">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-4 border-blue-500"></div>
    </div>
  );
};

export default Spinner;