#!/bin/bash

# 1. Update types.ts
sed -i 's/left: number; \/\/ percentage 0-100/left: number;\n  labelTop?: number;\n  labelLeft?: number;/g' src/types.ts

# 2. Update MatchingGame.tsx to use gameKey
sed -i 's/const \[selectedCategoryId/const \[gameKey, setGameKey\] = useState(0);\n  const \[selectedCategoryId/' src/components/MatchingGame.tsx
sed -i 's/startTimeRef.current = Date.now();/startTimeRef.current = Date.now();\n    setGameKey(prev => prev + 1);/' src/components/MatchingGame.tsx
sed -i 's/<DiagramGame/<DiagramGame key={gameKey}/' src/components/MatchingGame.tsx
