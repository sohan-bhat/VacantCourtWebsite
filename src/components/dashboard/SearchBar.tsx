import '../../styles/dashboard/SearchBar.css';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Search courts..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoComplete='off'
      />
    </div>
  );
}

export default SearchBar;