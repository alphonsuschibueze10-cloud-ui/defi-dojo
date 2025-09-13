;; Manual test for dojo-badge contract
(contract-call? .dojo-badge initialize)
(contract-call? .dojo-badge get-badge-xp u1)
(contract-call? .dojo-badge mint-quest-badge 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u1)
(contract-call? .dojo-badge get-user-xp 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(contract-call? .dojo-badge get-total-supply)
