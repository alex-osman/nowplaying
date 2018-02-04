export class Wallet {
    private _sbd: number;
    private _steem: number;


    parseSBD(value: string) {
        this._sbd = parseInt(value.split(' ')[0])
    }

    parseSteem(value: string) {
		console.log(value)
        this._steem = parseInt(value.split(' ')[0])
    }

	public get sbd(): number {
		return this._sbd;
	}

	public set sbd(value: number) {
		this._sbd = value;
	}

	public get steem(): number {
		return this._steem;
	}

	public set steem(value: number) {
		this._steem = value;
	}

}