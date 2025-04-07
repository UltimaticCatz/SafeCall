import sys
import os

# Add the project root to Python's path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.insert(0, project_root)

# Now we can import from PrologInterface
from PrologInterface import PrologInterface

def main():
    # Get the path to the Prolog file - using absolute path
    prolog_file = os.path.abspath(os.path.join(project_root, 
                   "LinguisticAnalyzer", "rules.pl"))
    
    print(f"Looking for .pl at: {prolog_file}")
    
    # Check if the file exists
    if not os.path.exists(prolog_file):
        print(f"ERROR: Prolog file does not exist: {prolog_file}")
        return
    
    try:
        # Initialize the Prolog interface
        prolog = PrologInterface(prolog_file)
        
        print("Testing Prolog Interface")
        query = ("detect_scam([['ผม', 'มาจาก', 'ธนาคาร', 'กรุงไทย', 'กรุณา', 'ให้', 'ข้อมูล', 'บัญชี', 'ของคุณ', 'ทันที']], Matches).")
        
        # Enable debug to see what's happening
        result = prolog.query(query, debug=False)
        
        print(result)
    
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()