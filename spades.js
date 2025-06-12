


$(document).ready(function () {
	const BLIND_NILL='😎';
	const LAB_NILL='🤪';
	const bidValues=['1','2','3','4','5','6','7','8','9','10','0',BLIND_NILL,LAB_NILL];
	
	let names=["player 1","player 2","player 3","player 4"];	
	let scoreData=new SpadesData();
	
	const PROCESS_BIDS=0;
	const PROCESS_TRICKS=1;
	let action="";
	
    // Create 10 rows × 6 columns
    for (let r = 0; r <= 10; r++) {
        const tr = $('<tr></tr>');
        for (let c = 0; c <= 5; c++) {
		tr.append(`<td class="row${r}" data-row="${r}" data-col="${c}" tabindex="0"></td>`);
        }
        $('#mainTable tbody').append(tr);
    }

    let $selectedCell = null;

	//-------------------------------------------------------------------
    // Show names popup 
    $('#mainTable th').on('click', function () {
		for(let x=0; x<4;x++)	
			$(`#name${x}`).val(names[x]);

        const offset = $(this).offset();
        $selectedCell = $(this);
        $('#namesPopup').css({
            top: offset.top + ($selectedCell.outerHeight()),
            left: 10,
            display: 'block',
            visibility: 'visible'
        });
    });

    $('#closeNamesPopup').on('click', function () {
		names[0]=$('#name0').val();
		names[1]=$('#name1').val();
		names[2]=$('#name2').val();
		names[3]=$('#name3').val();
		
		if (names[0] != "" && names[3] != "")
			$('#team1').html(names[0] + " / " + names[3]);
		if (name[1] != "" && name[2] != "")
			$('#team2').html(names[1] + " / " + names[2]);	
		
        $('#namesPopup').hide();
    });
	
	// --------------------------------------------------------------
    // Show bid/trick popup dialog box
    $('#mainTable').on('click', 'td', function () {
        const row = $(this).data('row');
        const col = $(this).data('col');
		if (row==undefined)
			return;
		
		$(".selected").removeClass("selected");
		$('#BTmsg').html("");
		//let bids=[];		
		
		//bid box clicked on
        if ((col === 0 || col === 3)) {
			$(`.row${row}`).addClass("selected");
			action=PROCESS_BIDS;
			
			//only allow last row modificication or new row entry
			if (row==scoreData.lastRowWithData() && scoreData.trickCount(row)==0)
				; //bids=scoreData.getBids(row);
			else if (row==scoreData.firstEmptyRow())
				;
			else
				return;

			//put names and possible bids in popup
			let bids=scoreData.getBids(row);
			for(let x=0; x<4; x++) {
				$(`#ddText${x}`).html(names[x]);	//put in name
				$(`#dropdownBT${x}`).empty();
				for (let num = 0; num <= 12; num++) 
					$(`#dropdownBT${x}`).append(`<option value="${bidValues[num]}">${bidValues[num]}</option>`);
				$(`#dropdownBT${x}`).val(bids[x]);	
			}
			
		}
		//points (tricks) box clicked on	
		else if ((col === 1 || col === 4)) { 
			$(`.row${row}`).addClass("selected");
			action=PROCESS_TRICKS;
			//put bids and possible tricks taken in popup
			let bids=scoreData.getBids(row);
			let tricks=scoreData.getTricks(row);
			for(let x=0; x<4; x++) {
				$(`#ddText${x}`).html(`bid: ${bids[x]}`);  
				$(`#dropdownBT${x}`).empty();
				for (let num = 0; num <= 9; num++) 
					$(`#dropdownBT${x}`).append(`<option value="${num}">${num}</option>`);
				$(`#dropdownBT${x}`).val(tricks[x]);
			}
		}		

		//show popup box
		$selectedCell = $(this);
		const offset = $selectedCell.offset();
		//$('#popup').css({ visibility: 'hidden', display: 'block' });
		const w = $('#bidsPopup').outerWidth(),
		h = $('#bidsPopup').outerHeight();

		$('#bidsPopup').css({
			top: offset.top + ($selectedCell.outerHeight()),
			left: 75,
			display: 'block',
			visibility: 'visible'
		});

        //for (let i = 1; i <= 4; i++)
        //    $(`#dropdown${i}`).val('0');
    });

	// -------------------------------------------------------
	//Closing Bids/Tricks dialog box
    $('#closeBTPopup').on('click', function () {
        if (!$selectedCell) 
			return;
		if (action==PROCESS_BIDS) {
            const row = $selectedCell.data('row');
			let bids=[];
			for(let x=0;x<4;x++)
				bids[x] = $(`#dropdownBT${x}`).val();
			if (!bids[0] || !bids[1] || !bids[2] || !bids[3]) {
				$('#BTmsg').html("Please enter 4 bids!");
				return;
			}
			scoreData.saveBids(bids,row);
			
            $(`#mainTable td[data-row="${row}"][data-col="0"]`).text(`${bids[0]} / ${bids[3]}`);
            $(`#mainTable td[data-row="${row}"][data-col="3"]`).text(`${bids[1]} / ${bids[2]}`);
		} 
		else if (action==PROCESS_TRICKS) {
            const row = $selectedCell.data('row');
			let tricks=[];
			//get tricks and verify they add up to 13
			for(let x=0;x<4;x++) 
				tricks[x] = parseInt($(`#dropdownBT${x}`).val());
			if ((tricks[0]+tricks[1]+tricks[2]+tricks[3]) != 13) {
				$('#BTmsg').html("Trick total must be 13!");
				return;
			}
			
			//save and display tricks and scores and grand totals
			scoreData.saveTricks(tricks,row);
			$(`#mainTable td[data-row="${row}"][data-col="1"]`).text(`${tricks[0]} / ${tricks[3]}`);
            $(`#mainTable td[data-row="${row}"][data-col="4"]`).text(`${tricks[1]} / ${tricks[2]}`);
			
			let scores=scoreData.getScores(row);
			$(`#mainTable td[data-row="${row}"][data-col="2"]`).text(`${scores[0]}`);
			$(`#mainTable td[data-row="${row}"][data-col="5"]`).text(`${scores[1]}`);
			
			let totals=scoreData.getTotals();
			$(`#mainTable td[data-row="${row+1}"][data-col="2"]`).text(""); //erase old total display
			$(`#mainTable td[data-row="${row+1}"][data-col="5"]`).text("");
			$(`#mainTable td[data-row="${row+2}"][data-col="2"]`).text(`${totals[0]}`); //show new totals
			$(`#mainTable td[data-row="${row+2}"][data-col="5"]`).text(`${totals[1]}`);
		}
		
		//close the popup
        $('#bidsPopup').hide();
        $selectedCell = null;
		//$(".selected").removeClass("selected");
    });
	
	// -------------------------------------------------------
	//Cancelling Bids/Tricks dialog box	
   $('#cancelBTPopup').on('click', function () {
        $('#bidsPopup').hide();
        $selectedCell = null;
		//$(".selected").removeClass("selected");
    });
	

    // Click outside to close any popup
	/*
    $(document).on('mousedown', function (e) {
        if (!$(e.target).closest('.popup, td, th').length) {
            $('#bidsPopup, #namesPopup').hide();
            $selectedCell = null;
        }
    });
	*/
});

//===============================================================================
class SpadesData {
	static ROWS=20;
	
	#bids;		//ROWSx4	[row][player]
	#tricks;	//ROWSx4	[row][player]
	
	#scores;	//ROWSx2	[row][team]	
	#bags;		//ROWSx2	[row][team]

	
	constructor() {
		this.#bids=[];
		this.#tricks=[];
		this.#scores=[];
		this.#bags=[];
		for(let x=0;x<SpadesData.ROWS;x++) {
			this.#bids.push(["","","",""])
			this.#tricks.push([0,0,0,0])
			this.#scores.push([0,0]);
			this.#bags.push([0,0]);			
		}
	}
	
	firstEmptyRow() {
		let x=0;
		let bids=this.#bids;
		while (x<bids.length && bids[x][0]!="")
			x++;
		return x;
	}
	
	lastRowWithData() {
		return this.firstEmptyRow()-1;
	}
	
	trickCount(row) {
		let tricks=this.#tricks[row];
		return tricks[0]+tricks[1]+tricks[2]+tricks[3];	
	}

	saveBids(bids, row) {
		this.#bids[row] = bids;
	}
	
	getBids(row) {
		return this.#bids[row];
	}
	
	saveTricks(tricks, row) {
		this.#tricks[row] = tricks;
		this.updateScores(row);	
	}
	
	getTricks(row) {
		return this.#tricks[row];
	}
	
	getScores(row) {
		return this.#scores[row];
	}
	
	getTotals() { //returns [total_1 ,total_2]
		let totals=[0,0];
		let bags=[0,0];
		for(let team=0;team<2;team++) {		
			for(let x=0;x<SpadesData.ROWS;x++) {
				totals[team]+=this.#scores[x][team];
				bags[team]+=this.#bags[x][team];
			}
			totals[team]-=Math.floor(bags[team]/10)*100;
		}
		return totals;
	}
	
	updateScores(row) {
		//update the scores (and bags) for one round
		let bids=this.#bids[row];
		let tricks=this.#tricks[row];
		let nilBids=[bids[0]==0, bids[1]==0, bids[2]==0, bids[3]==0]; //booleans
		
		let teamBids=[ parseInt(bids[0])+parseInt(bids[3]), parseInt(bids[1])+parseInt(bids[2]) ];
		let teamTricks=[ tricks[0]+tricks[3], tricks[1]+tricks[2] ];
		let teamScores=[0,0];
		let teamBags=[0,0];
		
		for(let x=0;x<2;x++) {
			if (teamTricks[x]<teamBids[x]) {
				teamScores[x]=teamBids[x]*(-10);
				teamBags[x]=0;
			} else { 
				teamScores[x]=(teamBids[x]*10)+(teamTricks[x]-teamBids[x]);
				teamBags[x]=(teamTricks[x]-teamBids[x])
			}
		}
		
		//TODO - handle blind and labotamy nills
		
		//regular nills
		let teamNums=[0,1,1,0]; //player 0 & 3 are team 0,  players 1 & 2 are team 1
		for(let x=0;x<4;x++) {
			if (nilBids[x]) {
				let teamNum=teamNums[x];
				if (tricks[x]==0)
					teamScores[teamNum]+=100;
				else
					teamScores[teamNum]-=100;
			}				
		}		
		
		//update object
		this.#scores[row][0]=teamScores[0];
		this.#scores[row][1]=teamScores[1];
		this.#bags[row][0]=teamBags[0];
		this.#bags[row][1]=teamBags[1];
	}
}