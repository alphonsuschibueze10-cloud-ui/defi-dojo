;; DeFi Dojo Badge Contract
;; Simple NFT contract for minting achievement badges

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant MAX-SUPPLY u1000)

;; Data Variables
(define-data-var last-token-id uint u0)
(define-data-var mint-enabled bool true)

;; Non-fungible token
(define-non-fungible-token dojo-badge uint)

;; User XP tracking
(define-map user-xp principal uint)

;; Badge XP rewards
(define-map badge-xp uint uint)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-MINT-DISABLED (err u101))
(define-constant ERR-MAX-SUPPLY-REACHED (err u102))
(define-constant ERR-INVALID-BADGE-TYPE (err u103))

;; Helper functions
(define-private (is-owner? (caller principal))
  (is-eq caller CONTRACT-OWNER)
)

(define-private (increment-token-id)
  (var-set last-token-id (+ (var-get last-token-id) u1))
)

;; Public functions

;; Mint badge for quest completion
(define-public (mint-quest-badge (recipient principal) (badge-id uint))
  (let (
    (caller tx-sender)
    (mint-enabled-var (var-get mint-enabled))
    (current-supply (var-get last-token-id))
    (xp-reward (unwrap! (map-get? badge-xp badge-id) ERR-INVALID-BADGE-TYPE))
  )
    (asserts! mint-enabled-var ERR-MINT-DISABLED)
    (asserts! (< current-supply MAX-SUPPLY) ERR-MAX-SUPPLY-REACHED)
    (asserts! (is-owner? caller) ERR-NOT-AUTHORIZED)
    (begin
      ;; Mint the NFT
      (try! (nft-mint? dojo-badge badge-id recipient))
      
      ;; Award XP
      (let ((current-xp (default-to u0 (map-get? user-xp recipient))))
        (map-set user-xp recipient (+ current-xp xp-reward))
      )
      
      ;; Increment token ID
      (increment-token-id)
      (ok badge-id)
    )
  )
)

;; Get user XP
(define-read-only (get-user-xp (user principal))
  (default-to u0 (map-get? user-xp user))
)

;; Get badge XP reward
(define-read-only (get-badge-xp (badge-id uint))
  (map-get? badge-xp badge-id)
)

;; Get total supply
(define-read-only (get-total-supply)
  (var-get last-token-id)
)

;; Admin functions

;; Toggle minting
(define-public (set-mint-enabled (enabled bool))
  (let ((caller tx-sender))
    (asserts! (is-owner? caller) ERR-NOT-AUTHORIZED)
    (ok (var-set mint-enabled enabled))
  )
)

;; Add new badge type (admin only)
(define-public (add-badge-type (badge-id uint) (xp-reward uint))
  (let ((caller tx-sender))
    (asserts! (is-owner? caller) ERR-NOT-AUTHORIZED)
    (ok (map-set badge-xp badge-id xp-reward))
  )
)

;; Initialize contract with default badges
(define-public (initialize)
  (let ((caller tx-sender))
    (asserts! (is-owner? caller) ERR-NOT-AUTHORIZED)
    (begin
      ;; Liquidity Kata Badge (ID 1) - 50 XP
      (map-set badge-xp u1 u50)
      
      ;; Yield Sprint Badge (ID 2) - 75 XP
      (map-set badge-xp u2 u75)
      
      ;; Arbitrage Master Badge (ID 3) - 100 XP
      (map-set badge-xp u3 u100)
      
      ;; DeFi Ninja Badge (ID 4) - 150 XP
      (map-set badge-xp u4 u150)
      
      (ok true)
    )
  )
)