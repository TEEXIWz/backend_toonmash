export interface VotePostRequest {
    vid:       number;
    winner:    number;
    loser:     number;
    scoreWin:  number;
    scoreLose: number;
    fgPrint:   string;
    voted_at:  string;
}
