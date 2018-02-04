const steem = require('steem')
import {
	User
} from './user';

export class Wallet {
	private _sbd: number;
	private _steem: number;
	private _user: User;
	private _activeKey: string;

	constructor(user, activeKey ? ) {
		this._user = user
		this._activeKey = activeKey
	}

	setActive(activeKey: string) {
		this._activeKey = activeKey
	}

	parseSBD(value: string) {
		this._sbd = parseFloat(value.split(' ')[0])
	}

	parseSteem(value: string) {
		this._steem = parseFloat(value.split(' ')[0])
	}

	sendSteem(to: User, amount: number): Promise < any > {
		console.log(`sending ${amount} steem to ${to.username}`)
		return new Promise((resolve, reject) => {
			steem.broadcast.transfer(this._activeKey, this._user.username, to.username, `${amount.toFixed(3)} STEEM`, 'sent through sendSteem', (err, result) => {
				if (err) {
					if (err.stack.includes('private_key required')) {
						reject({
							error: 'private key'
						})
					} else if (err.stack.includes('false: invalid symbol')) {
						reject({
							error: 'bad format'
						})
					}
					reject({
						error: err
					})
				} else {
					// resolve on the transaction id
					resolve(result.id)
				}
			});
		})
	}

	powerUp(to: User, amount: number): Promise < any > {
		console.log(`powering up ${amount} steem to ${to.username}`)
		return new Promise((resolve, reject) => {
			steem.broadcast.transferToVesting(this._activeKey, this._user.username, to.username, `${amount.toFixed(3)} STEEM`, (err, result) => {
				if (err) {
					if (err.stack.includes('private_key required')) {
						reject({
							error: 'private key'
						})
					} else if (err.stack.includes('false: invalid symbol')) {
						reject({
							error: 'bad format'
						})
					}
					reject({
						error: err
					})
				} else {
					resolve(result)
				}
			})
		})
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