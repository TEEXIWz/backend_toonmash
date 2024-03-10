export interface VotePostRequest {
    vid:       number;
    winner:    number;
    loser:     number;
    scoreWin:  number;
    scoreLose: number;
    voted_at:  string;
}
