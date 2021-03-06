import { Game } from './models/game.model';
import { Queen } from './models/queen.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})


export class BoardService {
	private numOfRowsAndCols: number;
	private queensPositions: number[][] = [];
	private queensOccipiedPositions: number[][] = [];
	private numOffQueensToFind: number = 8;
	private game = new Game();

	gameStatus = new BehaviorSubject(this.game.getGameStatus());
	gameRestarted = new Subject();

	constructor() { }

	//
	// single validation funciton

	validateQueenPosition(queenPosition: Queen["position"]) {
		let queenPlacementIsValid = true;
		// get all the blueprint positions from the functions 
		const markedOccupiedPositions = [
			[queenPosition.row, queenPosition.col],
			...this.markDiagonalLineAbovePos(queenPosition),
			...this.markDiagonalLineBelowPos(queenPosition),
			...this.markLeftToRight(queenPosition),
			...this.markTopToBottom(queenPosition)
		];

		// go over each location and compere it with the already taken spots.
		markedOccupiedPositions.forEach((markedPosition: number[]) => [
			this.getQueensPositions().forEach((queenPosition: number[]) => {
				if (markedPosition.toString() === queenPosition.toString()) {
					console.log(queenPosition);
					console.log(markedPosition);
					queenPlacementIsValid = false;
				}
			})
		])

		// if the location is valid location, push new queen into it.
		if (queenPlacementIsValid) {
			this.queensPositions.push([queenPosition.row, queenPosition.col]);
			this.queensOccipiedPositions.push(...markedOccupiedPositions);
		}


		return queenPlacementIsValid;
	}




	// use these funcitons as a blueprint to mark which areas the newly placed queen will block
	markDiagonalLineBelowPos(queenPosition: Queen["position"]) {
		const occupiedCells = []
		for (let row = queenPosition.row + 1, col = queenPosition.col; row <= this.numOfRowsAndCols; row++) {
			if (++col <= this.numOfRowsAndCols && row <= this.numOfRowsAndCols) {
				if (!this.isPositionExistsAlready(occupiedCells, [row, col])) {
					occupiedCells.push([row, col]);
				}
			}
		}
		for (let row = queenPosition.row + 1, col = queenPosition.col; row <= this.numOfRowsAndCols; row++) {
			if (--col > 0 && row <= this.numOfRowsAndCols) {
				if (!this.isPositionExistsAlready(occupiedCells, [row, col])) {
					occupiedCells.push([row, col]);
				}
			}
		}
		return occupiedCells;
	}

	markDiagonalLineAbovePos(queenPosition: Queen["position"]) {
		const occupiedCells = []
		for (let row = queenPosition.row - 1, col = queenPosition.col; row > 0; row--) {
			if (--col > 0 && row > 0) {
				if (!this.isPositionExistsAlready(occupiedCells, [row, col])) {
					occupiedCells.push([row, col]);
				}
			}
		}

		for (let row = queenPosition.row - 1, col = queenPosition.col; row > 0; row--) {
			if (++col > 0 && row > 0) {
				if (!this.isPositionExistsAlready(occupiedCells, [row, col])) {
					occupiedCells.push([row, col]);
				}
			}
		}
		return occupiedCells;
	}

	markTopToBottom(queenPosition: Queen["position"]) {
		const occupiedCells = [];
		for (let row = 1; row <= this.numOfRowsAndCols; row++) {
			if (row !== queenPosition.row) {
				occupiedCells.push([row, queenPosition.col])
			}
		}
		return occupiedCells;
	}

	markLeftToRight(queenPosition: Queen["position"]) {
		const occupiedCells = [];
		for (let col = 1; col <= this.numOfRowsAndCols; col++) {
			if (col !== queenPosition.col) {
				occupiedCells.push([queenPosition.row, col])
			}
		}
		return occupiedCells;
	}
	// end of blueprint functions 







	// utilities functions
	isPositionExistsAlready(checkInArray: number[], position: number[]): boolean {
		if (checkInArray.toString().includes(position.toString())) {
			return true;
		}
	}

	setQueenPosition(queenPosition: Queen["position"]) {
		// for starting, the cell is empty.
		let placedWell = null;
		let alreadyExists = false;

		// go over the queens position and look for already placed queen in that cell.
		this.queensPositions.forEach((queen) => {
			if (queen.toString() === [queenPosition.row, queenPosition.col].toString()) {
				alreadyExists = true;
			}
		});

		// if there is no queen in that cell..
		if (!alreadyExists) {
			if (this.validateQueenPosition(queenPosition)) {
				placedWell = true;
				if (this.getQueensPositions().length === this.numOffQueensToFind) {
					this.game.setGameStatus({ over: true, result: 'win' });
					this.gameStatus.next(this.game.getGameStatus());
				}
			}

			else {
				this.game.setGameStatus({ over: true, result: 'lose' });
				this.gameStatus.next(this.game.getGameStatus());
				placedWell = false;;
			}
		}
		else {
			// if there is a queen, clean the cell.
			this.cleanCell(queenPosition);
		}
		return placedWell;
	}


	getQueensPositions(): number[][] {
		return this.queensPositions;
	}


	getQueensOccipiedPositions(): number[][] {
		return this.queensOccipiedPositions;
	}

	restartGame(): void {
		this.game.setGameStatus({ over: false, result: null });
		this.queensOccipiedPositions = [];
		this.queensPositions = [];
		this.gameRestarted.next(true);
	}


	setBoardSize(size: number = 8): number {
		return this.numOfRowsAndCols = size;
	}

	getBoardSize(): number {
		return this.numOfRowsAndCols;
	}

	cleanCell(queenPosition) {
		// Get all related occipied Positions by that cell.
		const markedOccupiedPositions = [
			[queenPosition.row, queenPosition.col],
			...this.markDiagonalLineAbovePos(queenPosition),
			...this.markDiagonalLineBelowPos(queenPosition),
			...this.markLeftToRight(queenPosition),
			...this.markTopToBottom(queenPosition)
		];

		// remove the queen from the queens list.
		const filterdQueensPositions = this.getQueensPositions()
			.filter((queenPos) => queenPos.toString() !== [queenPosition.row, queenPosition.col].toString());


		// remove all the occipied Positions one by one.
		this.queensPositions = filterdQueensPositions;
		for (let marked of markedOccupiedPositions) {
			this.getQueensOccipiedPositions().filter((occpiedPos, index) => {
				if (occpiedPos.toLocaleString() === marked.toString()) {
					this.queensOccipiedPositions.splice(index, 1);
					return occpiedPos.toString() === marked.toString();
				}
			})
		}
	}
}
