;; Test script for dojo-badge contract
;; This file contains test transactions to verify contract functionality

;; Test 1: Initialize the contract
(contract-call? .dojo-badge initialize)

;; Test 2: Check if badge types were added
(contract-call? .dojo-badge get-badge-xp u1)
(contract-call? .dojo-badge get-badge-xp u2)
(contract-call? .dojo-badge get-badge-xp u3)
(contract-call? .dojo-badge get-badge-xp u4)

;; Test 3: Mint a badge for wallet_1
(contract-call? .dojo-badge mint-quest-badge 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u1)

;; Test 4: Check user XP after minting
(contract-call? .dojo-badge get-user-xp 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)

;; Test 5: Check total supply
(contract-call? .dojo-badge get-total-supply)

;; Test 6: Try to mint from non-owner (should fail)
(contract-call? .dojo-badge mint-quest-badge 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u2)

;; Test 7: Add a new badge type
(contract-call? .dojo-badge add-badge-type u5 u200)

;; Test 8: Mint the new badge type
(contract-call? .dojo-badge mint-quest-badge 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u5)
