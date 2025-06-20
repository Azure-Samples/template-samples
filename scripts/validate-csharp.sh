#!/bin/bash
set -e

echo "=== C# Sample Validation ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_SAMPLES=0
SUCCESSFUL_SAMPLES=0
FAILED_SAMPLES=0

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to validate a single C# sample
validate_sample() {
    local sample_dir="$1"
    local sample_name=$(basename "$sample_dir")
    
    log "Validating C# sample: ${sample_name}"
    
    # Check if directory exists
    if [ ! -d "$sample_dir" ]; then
        echo -e "${RED}❌ Sample directory does not exist: $sample_dir${NC}"
        return 1
    fi
    
    # Change to sample directory
    cd "$sample_dir"
    
    # Check for .csproj file
    if [ ! -f *.csproj ]; then
        echo -e "${RED}❌ No .csproj file found in $sample_dir${NC}"
        cd - > /dev/null
        return 1
    fi
    
    local csproj_file=$(ls *.csproj | head -1)
    log "Found project file: $csproj_file"
    
    # Step 1: Restore dependencies
    log "Restoring NuGet packages..."
    if ! dotnet restore --verbosity quiet; then
        echo -e "${RED}❌ Failed to restore packages for $sample_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    # Step 2: Build project
    log "Building project..."
    if ! dotnet build --no-restore --configuration Release --verbosity quiet; then
        echo -e "${RED}❌ Failed to build $sample_name${NC}"
        cd - > /dev/null
        return 1
    fi
    
    # Step 3: Check for common issues
    log "Running static analysis checks..."
    
    # Check for proper using statements
    if ! grep -q "using Azure.AI.OpenAI" *.cs 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: No Azure.AI.OpenAI using statement found in $sample_name${NC}"
    fi
    
    if ! grep -q "using OpenAI.Chat" *.cs 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: No OpenAI.Chat using statement found in $sample_name${NC}"
    fi
    
    # Check for proper client instantiation
    if ! grep -q "AzureOpenAIClient" *.cs 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: No AzureOpenAIClient instantiation found in $sample_name${NC}"
    fi
    
    # Step 4: Format check (if dotnet format is available)
    if command -v dotnet-format &> /dev/null || dotnet tool list -g | grep -q dotnet-format; then
        log "Checking code formatting..."
        if ! dotnet format --verify-no-changes --verbosity quiet 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Warning: Code formatting issues detected in $sample_name${NC}"
        fi
    else
        log "Skipping format check (dotnet format not available)"
    fi
    
    # Step 5: Check for basic code patterns
    log "Validating code patterns..."
    
    # Check for async/await pattern
    if ! grep -q "await.*Complete.*Chat.*Async" *.cs 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: Expected async chat completion pattern not found in $sample_name${NC}"
    fi
    
    # Check for proper output handling
    if ! grep -q "Console.WriteLine" *.cs 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Warning: No console output found in $sample_name${NC}"
    fi
    
    # Step 6: Verify dependencies in csproj
    log "Validating project dependencies..."
    
    local required_packages=("Azure.AI.OpenAI" "OpenAI")
    for package in "${required_packages[@]}"; do
        if ! grep -q "PackageReference.*$package" "$csproj_file"; then
            echo -e "${YELLOW}⚠️  Warning: Required package $package not found in $csproj_file${NC}"
        fi
    done
    
    # Return to original directory
    cd - > /dev/null
    
    echo -e "${GREEN}✅ C# sample $sample_name validated successfully${NC}"
    return 0
}

# Main validation logic
main() {
    local samples_dir="generated-samples/csharp"
    
    # Check if samples directory exists
    if [ ! -d "$samples_dir" ]; then
        echo -e "${RED}❌ C# samples directory not found: $samples_dir${NC}"
        echo "Make sure to run sample generation first."
        exit 1
    fi
    
    # Find all sample directories
    local sample_dirs=($(find "$samples_dir" -mindepth 1 -maxdepth 1 -type d))
    
    if [ ${#sample_dirs[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No C# samples found in $samples_dir${NC}"
        exit 0
    fi
    
    log "Found ${#sample_dirs[@]} C# sample(s) to validate"
    
    # Validate each sample
    for sample_dir in "${sample_dirs[@]}"; do
        TOTAL_SAMPLES=$((TOTAL_SAMPLES + 1))
        
        if validate_sample "$sample_dir"; then
            SUCCESSFUL_SAMPLES=$((SUCCESSFUL_SAMPLES + 1))
        else
            FAILED_SAMPLES=$((FAILED_SAMPLES + 1))
        fi
        
        echo # Empty line for readability
    done
    
    # Summary
    echo "=== C# Validation Summary ==="
    echo "Total samples: $TOTAL_SAMPLES"
    echo -e "Successful: ${GREEN}$SUCCESSFUL_SAMPLES${NC}"
    echo -e "Failed: ${RED}$FAILED_SAMPLES${NC}"
    
    if [ $FAILED_SAMPLES -gt 0 ]; then
        echo -e "${RED}❌ C# validation failed with $FAILED_SAMPLES error(s)${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ All C# samples validated successfully!${NC}"
        exit 0
    fi
}

# Check dependencies
check_dependencies() {
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET CLI not found. Please install .NET SDK.${NC}"
        exit 1
    fi
    
    log "Using .NET version: $(dotnet --version)"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi
