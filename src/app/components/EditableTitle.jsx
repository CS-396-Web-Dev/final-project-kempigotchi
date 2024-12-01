const EditableTitle = ({ title, setTitle, editingTitle, setEditingTitle, update }) => {
    const handleTitleClick = () => {
        setEditingTitle(true);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleTitleSave = () => {
        setEditingTitle(false);
        update({ title }); // Save the title to Firebase
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleTitleSave();
        }
    };

    return (
        <div className="mt-6 w-full text-center px-4">
            {editingTitle ? (
            <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={handleKeyDown}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white bg-transparent border-b-2 border-white focus:outline-none focus:border-blue-500"
                aria-label="Edit pet title"
            />
            ) : (
            <h1
                onClick={handleTitleClick}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white drop-shadow-lg cursor-pointer"
                title="Click to edit title"
            >
                {title}
            </h1>
            )}
        </div>
    );
};

export default EditableTitle;