;; DeFi Dojo Badge Trait
;; Trait definition for the DeFi Dojo badge contract

(define-trait dojo-badge-trait
  (
    ;; NFT standard functions
    (get-last-token-id () (response uint uint))
    (get-token-uri (uint) (response (optional (string-utf8 256)) uint))
    (get-owner (uint) (response (optional principal) uint))
    (transfer (uint principal principal) (response bool uint))
    
    ;; DeFi Dojo specific functions
    (mint-quest-badge (principal (string-utf8 50)) (response uint uint))
    (mint-custom-badge (principal uint) (response uint uint))
    (get-user-xp (principal) (response uint uint))
    (get-badge-metadata (uint) (response (optional {name: (string-utf8 50), description: (string-utf8 200), rarity: (string-utf8 20), xp-reward: uint}) uint))
    (get-quest-badge ((string-utf8 50)) (response (optional uint) uint))
    (get-total-supply () (response uint uint))
    (get-contract-uri () (response (optional (string-utf8 256)) uint))
    
    ;; Admin functions
    (set-mint-enabled (bool) (response bool uint))
    (set-contract-uri ((optional (string-utf8 256))) (response bool uint))
    (add-badge-type (uint (string-utf8 50) (string-utf8 200) (string-utf8 20) uint) (response bool uint))
    (add-quest-badge ((string-utf8 50) uint) (response bool uint))
    (initialize () (response bool uint))
  )
)
