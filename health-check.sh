#!/bin/bash

# ConfirmIT Health Check Script
# This script verifies that all services are properly configured and running

echo "🏥 ConfirmIT Health Check"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall health
HEALTHY=true

echo "📋 Checking Configuration Files..."
echo ""

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env exists"
    
    # Check critical backend vars
    if grep -q "CLOUDINARY_API_KEY=" backend/.env && [ -n "$(grep CLOUDINARY_API_KEY= backend/.env | cut -d '=' -f2)" ]; then
        echo -e "  ${GREEN}✓${NC} CLOUDINARY_API_KEY is set"
    else
        echo -e "  ${RED}✗${NC} CLOUDINARY_API_KEY is missing or empty"
        HEALTHY=false
    fi
    
    if grep -q "CLOUDINARY_CLOUD_NAME=" backend/.env && [ -n "$(grep CLOUDINARY_CLOUD_NAME= backend/.env | cut -d '=' -f2)" ]; then
        echo -e "  ${GREEN}✓${NC} CLOUDINARY_CLOUD_NAME is set"
    else
        echo -e "  ${RED}✗${NC} CLOUDINARY_CLOUD_NAME is missing or empty"
        HEALTHY=false
    fi
    
    if grep -q "AI_SERVICE_URL=" backend/.env; then
        echo -e "  ${GREEN}✓${NC} AI_SERVICE_URL is set"
    else
        echo -e "  ${RED}✗${NC} AI_SERVICE_URL is missing"
        HEALTHY=false
    fi
else
    echo -e "${RED}✗${NC} Backend .env not found"
    HEALTHY=false
fi

echo ""

# Check AI service .env
if [ -f "ai-service/.env" ]; then
    echo -e "${GREEN}✓${NC} AI Service .env exists"
    
    if grep -q "GEMINI_API_KEY=" ai-service/.env && [ -n "$(grep GEMINI_API_KEY= ai-service/.env | cut -d '=' -f2)" ]; then
        echo -e "  ${GREEN}✓${NC} GEMINI_API_KEY is set"
    else
        echo -e "  ${RED}✗${NC} GEMINI_API_KEY is missing or empty"
        HEALTHY=false
    fi
else
    echo -e "${RED}✗${NC} AI Service .env not found"
    HEALTHY=false
fi

echo ""

# Check frontend .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env exists"
    
    if grep -q "VITE_CLOUDINARY_UPLOAD_PRESET=" .env && [ -n "$(grep VITE_CLOUDINARY_UPLOAD_PRESET= .env | cut -d '=' -f2)" ]; then
        echo -e "  ${GREEN}✓${NC} VITE_CLOUDINARY_UPLOAD_PRESET is set"
    else
        echo -e "  ${RED}✗${NC} VITE_CLOUDINARY_UPLOAD_PRESET is missing or empty"
        HEALTHY=false
    fi
    
    if grep -q "VITE_API_BASE_URL=" .env; then
        echo -e "  ${GREEN}✓${NC} VITE_API_BASE_URL is set"
    else
        echo -e "  ${RED}✗${NC} VITE_API_BASE_URL is missing"
        HEALTHY=false
    fi
else
    echo -e "${RED}✗${NC} Frontend .env not found"
    HEALTHY=false
fi

echo ""
echo "🌐 Checking Services..."
echo ""

# Check AI Service
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} AI Service is running (http://localhost:8000)"
else
    echo -e "${YELLOW}⚠${NC} AI Service is not responding (http://localhost:8000)"
    echo -e "  ${YELLOW}→${NC} Start with: cd ai-service && python run.py"
fi

# Check Backend
if curl -s -f http://localhost:8080/api > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running (http://localhost:8080)"
else
    echo -e "${YELLOW}⚠${NC} Backend is not responding (http://localhost:8080)"
    echo -e "  ${YELLOW}→${NC} Start with: cd backend && npm run start:dev"
fi

# Check Frontend
if curl -s -f http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running (http://localhost:5173)"
else
    echo -e "${YELLOW}⚠${NC} Frontend is not responding (http://localhost:5173)"
    echo -e "  ${YELLOW}→${NC} Start with: npm run dev"
fi

echo ""
echo "🔑 Testing Cloudinary Upload Preset..."
echo ""

# Test Cloudinary upload preset
CLOUDINARY_CLOUD_NAME=$(grep CLOUDINARY_CLOUD_NAME= backend/.env | cut -d '=' -f2 | tr -d '"' | tr -d ' ')
UPLOAD_PRESET=$(grep VITE_CLOUDINARY_UPLOAD_PRESET= .env | cut -d '=' -f2 | tr -d '"' | tr -d ' ')

if [ -n "$CLOUDINARY_CLOUD_NAME" ] && [ -n "$UPLOAD_PRESET" ]; then
    # Create a tiny test file
    echo "test" > /tmp/confirmit-test.txt
    
    RESPONSE=$(curl -s -X POST "https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/upload" \
        -F "upload_preset=$UPLOAD_PRESET" \
        -F "file=@/tmp/confirmit-test.txt" 2>&1)
    
    if echo "$RESPONSE" | grep -q "secure_url"; then
        echo -e "${GREEN}✓${NC} Cloudinary upload preset '$UPLOAD_PRESET' is working"
        # Clean up uploaded test file
        rm -f /tmp/confirmit-test.txt
    elif echo "$RESPONSE" | grep -q "Invalid upload preset"; then
        echo -e "${RED}✗${NC} Upload preset '$UPLOAD_PRESET' not found in Cloudinary"
        echo -e "  ${YELLOW}→${NC} Configure it at: https://console.cloudinary.com/settings/upload"
        echo -e "  ${YELLOW}→${NC} Preset name: $UPLOAD_PRESET"
        echo -e "  ${YELLOW}→${NC} Signing Mode: UNSIGNED (critical)"
        HEALTHY=false
    elif echo "$RESPONSE" | grep -q "Must supply api_key"; then
        echo -e "${RED}✗${NC} Upload preset exists but is not set to 'Unsigned' mode"
        echo -e "  ${YELLOW}→${NC} Go to Cloudinary console and set Signing Mode to 'Unsigned'"
        HEALTHY=false
    else
        echo -e "${YELLOW}⚠${NC} Could not verify Cloudinary upload preset"
        echo -e "  Response: $RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping Cloudinary test (missing configuration)"
fi

echo ""
echo "================================"
echo ""

if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All critical configuration checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Ensure all services are running (see warnings above)"
    echo "2. Open http://localhost:5173/quick-scan"
    echo "3. Upload a test receipt"
    echo ""
    echo "For more help, see STARTUP_GUIDE.md"
else
    echo -e "${RED}❌ Some configuration issues detected${NC}"
    echo ""
    echo "Please fix the issues marked with ✗ above"
    echo "See STARTUP_GUIDE.md for detailed instructions"
    echo ""
    exit 1
fi
