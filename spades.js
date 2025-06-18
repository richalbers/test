

$(document).ready(function () {
	const BLIND_NILL='😎';
	const LAB_NILL='🤪';
	const bidAmts=[1,2,3,4,5,6,7,8,9,0,-1,-2]; //order must match values
	const bidDisplays=['1','2','3','4','5','6','7','8','9','0',BLIND_NILL,LAB_NILL];
	
	/*
	bidValueToStr() {
	}
	bidStrToValue() {
	}
	*/
	
	let names=["","","",""];	
	let scoreData=new SpadesData();
	
	const PROCESS_BIDS=0;
	const PROCESS_TRICKS=1;
	let action="";

    // Create scoresheet
	let cellType=["bidCell","trickCell","totalCell","bidCell","trickCell","totalCell"];
    for (let r = 0; r < 20; r++) {
        const tr = $('<tr></tr>');
        for (let c = 0; c < 6; c++) {
			tr.append(`<td class="${cellType[c]} row${r}" data-row="${r}" data-col="${c}" tabindex="0"></td>`);
        }
        $('#scoreSheet tbody').append(tr);
    }

    let $selectedCell = null;

	//-------------------------------------------------------------------
    // show names popup 
    $('#scoreSheet th').on('click', function () {
		for(let x=0; x<4;x++)	
			$(`#nameTxtbox${x}`).val(names[x]);

        const offset = $(this).offset();
        $selectedCell = $(this);
        $('#namesPopup').css({
            top: offset.top + ($selectedCell.outerHeight()),
            left: 10,
            display: 'block',
            visibility: 'visible'
        });
    });

	// process/close names popup
    $('#namesSaveBtn').on('click', function () {
		names[0]=$('#nameTxtbox0').val();
		names[1]=$('#nameTxtbox1').val();
		names[2]=$('#nameTxtbox2').val();
		names[3]=$('#nameTxtbox3').val();
		
		if (names[0] != "" && names[3] != "")
			$('#team1').html(names[0] + " / " + names[3]);
		if (name[1] != "" && name[2] != "")
			$('#team2').html(names[1] + " / " + names[2]);	
		
        $('#namesPopup').hide();
    });
	
	// --------------------------------------------------------------
    // Show bid/trick popup dialog box
    //$('#scoreSheet).on('click', 'td', function () {
	$('.bidCell, .trickCell').on('click', function () {
        const row = $(this).data('row');
        //const col = $(this).data('col');
		
		let cellType="bidCell";
		if ($(this).attr("class").indexOf('trickCell')>=0)
			cellType="trickCell";
		
		$(".selected").removeClass("selected");
		$('#btMsg').html("");
		
        if ((cellType=="bidCell")) {
			//only allow last row modificication or new row entry
			if (row==scoreData.lastRowWithData() && scoreData.trickCount(row)==0)
				; //bids=scoreData.getBids(row);
			else if (row==scoreData.firstEmptyRow())
				;
			else
				return;
			
			$(`.bidCell.row${row}`).addClass("selected");
			action=PROCESS_BIDS;
			
			//put names and possible bids in popup
			let bids=scoreData.getBids(row);
			for(let x=0; x<4; x++) {
				$(`#btText${x}`).html(names[x]);	//put in name
				$(`#btDropDown${x}`).empty();
				for (let num = 0; num < bidAmts.length; num++)
					$(`#btDropDown${x}`).append(`<option value="${bidAmts[num]}">${bidDisplays[num]}</option>`);
				$(`#btDropDown${x}`).val( bids[x]);	
			}
			
		}
		//points box clicked on	
		else { 
			// only last row with data is allowed to have tricks entered.
			if (row!=scoreData.lastRowWithData())
				return;
			
			$(`.trickCell.row${row}`).addClass("selected");
			action=PROCESS_TRICKS;
			//put bids and possible tricks taken in popup
			let bids=scoreData.getBids(row);
			let teamBids=scoreData.getTeamBids(row);
			let tricks=scoreData.getTricks(row);		 //all 0's if entering for first time, or tricks previously entered
			let teamTricks=scoreData.getTeamTricks(row); //all 0's if entering for first time, or tricks previously entered
			for(let x=0; x<4; x++) {
				let ndx=bidAmts.indexOf(bids[x]);
				let bidDisp=bidDisplays[ndx];
				$(`#btText${x}`).html(`${names[x]} (${bidDisp})`);  
				$(`#btDropDown${x}`).empty();
				for (let num = 0; num <= 9; num++) 
					$(`#btDropDown${x}`).append(`<option value="${num}">${num}</option>`);
				$(`#btDropDown${x}`).val(tricks[x]);
			}
		}		

		//show popup box
		$selectedCell = $(this);
		const offset = $selectedCell.offset();
		//$('#popup').css({ visibility: 'hidden', display: 'block' });
		const w = $('#bidsTricksPopup').outerWidth(),
		h = $('#bidsTricksPopup').outerHeight();

		$('#bidsTricksPopup').css({
			top: offset.top + ($selectedCell.outerHeight()),
			left: 75,
			display: 'block',
			visibility: 'visible'
		});
    });

	// -------------------------------------------------------
	//Closing Bids/Tricks dialog box
    $('#btSaveBtn').on('click', function () {
        //if (!$selectedCell) 
		//	return;
		if (action==PROCESS_BIDS) {
            const row = $selectedCell.data('row');
			//get bids & validate 4 have been entered.
			let bids=[];
			for(let x=0;x<4;x++)
				bids[x] = parseInt($(`#btDropDown${x}`).val());
			if (!bids[0] && !bids[1] && !bids[2] && !bids[3]) {
				$('#btMsg').html("Not all 4 can be nil!");
				return;
			}
			scoreData.saveBids(bids,row);
			
			//show the team bids in the score sheet
			//if someone went nill, show both playwers bids, otherwise show team bid total
			//0-9 bids map to 0-9, but -1 and -2 map to icons for blind and lab nill.
			teamBidDisp=formatTeamBidDisplays(row);

            $(`#scoreSheet td[data-row="${row}"][data-col="0"]`).html(`${teamBidDisp[0]}`);
            $(`#scoreSheet td[data-row="${row}"][data-col="3"]`).html(`${teamBidDisp[1]}`);
		} 
		else if (action==PROCESS_TRICKS) {
            const row = $selectedCell.data('row');
			let tricks=[];
			//get tricks and verify they add up to 13
			for(let x=0;x<4;x++) 
				tricks[x] = parseInt($(`#btDropDown${x}`).val());
			if ((tricks[0]+tricks[1]+tricks[2]+tricks[3]) != 13) {
				$('#btMsg').html("Trick total must be 13!");
				return;
			}
			
			scoreData.saveTricks(tricks,row);

			//display round scores and totals to date
			let scores=scoreData.getScores(row);
			let html0=""+scores[0];
			let html1=""+scores[1];
			if (scoreData.bagAdjustment(row,0) >0)
				html0=html0+"<br>-100";
			if (scoreData.bagAdjustment(row,1) >0)
				html1=html1+"<br>-100";
			
			$(`#scoreSheet td[data-row="${row}"][data-col="1"]`).html(html0);
			$(`#scoreSheet td[data-row="${row}"][data-col="4"]`).html(html1);
			
			let totals=scoreData.getTotals(row);
			$(`#scoreSheet td[data-row="${row}"][data-col="2"]`).html(`${totals[0]}`); //show new totals
			$(`#scoreSheet td[data-row="${row}"][data-col="5"]`).html(`${totals[1]}`);
		}
		
		//close the popup
        $('#bidsTricksPopup').hide();
        $selectedCell = null;
		$(".selected").removeClass("selected");
    });
	
	// -------------------------------------------------------
	//Cancelling Bids/Tricks dialog box	
   $('#btCancelBtn').on('click', function () {
        $('#bidsTricksPopup').hide();
        $selectedCell = null;
		$(".selected").removeClass("selected");
    });
	
	//==================================================================================
	//format the team bids for the score sheet
	//if someone went nill, show both playwers bids, otherwise show team bid total
	//0-9 bids map to 0-9, but -1 and -2 map to icons for blind and lab nill.
	//returns an array of two strings (one for each team)
	function formatTeamBidDisplays(row) {
		let bids=scoreData.getBids(row);
		let teamBids=scoreData.getTeamBids(row);
		
		let bidDisp=["","","",""];
		for (x=0;x<4;x++) { 
			let ndx=bidAmts.indexOf(bids[x]);
			bidDisp[x]=bidDisplays[ndx];
		}
		
		teamBidDisp=["",""];
		if (bids[0]<=0 || bids[3]<=0)
			teamBidDisp[0]=`${bidDisp[0]} / ${bidDisp[3]}`;
		else
			teamBidDisp[0]=`${teamBids[0]}`;
		if (bids[1]<=0 || bids[2]<=0)
			teamBidDisp[1]=`${bidDisp[1]} / ${bidDisp[2]}`;
		else
			teamBidDisp[1]=`${teamBids[1]}`;
		
		return teamBidDisp;	//two element string array [team1Bid, team2bid]
	}

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
	static ROWS=30;
	
	#bids;		//ROWSx4	[row][player]  Players 0&3 are team1, 1&2 are team2
	#tricks;	//ROWSx4	[row][player]
	
	#scores;	//ROWSx2	[row][team]	
	#bags;		//ROWSx2	[row][team]
	#totalsToDate; //ROWSx2 [row][team]
	
	constructor() {
		this.#bids=[];			//player bids for each round
		this.#tricks=[];		//player tricks taken for each round
		this.#scores=[];		//team scores for each round
		this.#bags=[];			//team bags for each round
		this.#totalsToDate=[];	//team totals-to-date at the end of each round
		for(let x=0;x<SpadesData.ROWS;x++) {
			this.#bids.push([0,0,0,0])
			this.#tricks.push([0,0,0,0])
			this.#scores.push([0,0]);
			this.#bags.push([0,0]);	
			this.#totalsToDate.push([0,0]);
		}
	}
	
	firstEmptyRow() {
		let x=0;
		let bids=this.#bids;
		while (x<bids.length && bids[x][0]!=0)
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

	mnz(num) { //make nills (blind or labotamy) zero
		if (num<0)
			return 0;
		else
			return num;
	}
	
	getTeamBids(row) {
		let bidsTeam0=this.mnz(this.#bids[row][0])+this.mnz(this.#bids[row][3])
		let bidsTeam1=this.mnz(this.#bids[row][1])+this.mnz(this.#bids[row][2])
		return [bidsTeam0, bidsTeam1];
	}
	
	saveTricks(tricks, row) {
		this.#tricks[row] = tricks;
		this.computeRoundScores(row);	
	}
	
	getTricks(row) {
		return this.#tricks[row];
	}
	
	getTeamTricks(row) {
		return [this.#tricks[row][0]+this.#tricks[row][3],this.#tricks[row][1]+this.#tricks[row][2]];
	}	
	
	getScores(row) {
		return this.#scores[row];
	}
	
	//get game totals
	getTotals(row) { //returns [total_1 ,total_2]
		return [this.#totalsToDate[row][0], this.#totalsToDate[row][1]];
	}
	
	//compute the round scores, bags, and total-to-date for one round
	//Note: bids and tricks must already be filled in.
	computeRoundScores(row) {
		let bids=this.#bids[row];
		let tricks=this.#tricks[row];
		
		let teamBids=[ this.mnz(bids[0])+this.mnz(bids[3]), this.mnz(bids[1])+this.mnz(bids[2]) ];
		let teamTricks=[ tricks[0]+tricks[3], tricks[1]+tricks[2] ];
		let teamScores=[0,0];
		let teamBags=[0,0];
		
		//compute raw team scores based on bids and tricks taken
		for(let x=0;x<2;x++) {
			if (teamTricks[x]<teamBids[x]) {
				teamScores[x]=teamBids[x]*(-10);
				teamBags[x]=0;
			} else { 
				teamScores[x]=(teamBids[x]*10)+(teamTricks[x]-teamBids[x]);
				teamBags[x]=(teamTricks[x]-teamBids[x])
			}
		}
		
		//add/subtract 100/200/300 based on successful/unsuccessful nils
		let nilBids=[bids[0]==0, bids[1]==0, bids[2]==0, bids[3]==0]; //bool array denoting if each player went nill
		let blindNilBids=[bids[0]==-1, bids[1]==-1, bids[2]==-1, bids[3]==-1]; 	//bool array denoting blind nills
		let labNilBids=[bids[0]==-2, bids[1]==-2, bids[2]==-2, bids[3]==-2]; 	//bool array denoting lab nills
		let teamNums=[0,1,1,0]; //player 0 & 3 are team 0,  players 1 & 2 are team 1
		for(let x=0;x<4;x++) {
			let teamNum=teamNums[x];
			if (nilBids[x]) {
				if (tricks[x]==0) teamScores[teamNum]+=100;
				else teamScores[teamNum]-=100;
			} else if (blindNilBids[x]) { 
				if (tricks[x]==0) teamScores[teamNum]+=200;
				else teamScores[teamNum]-=200;
			} else if (labNilBids[x]) {
				if (tricks[x]==0) teamScores[teamNum]+=300;
				else teamScores[teamNum]-=300;
			}
		}		
		
		//save round score and bag count in object
		this.#scores[row][0]=teamScores[0];
		this.#scores[row][1]=teamScores[1];
		this.#bags[row][0]=teamBags[0];
		this.#bags[row][1]=teamBags[1];
		
		//compute total-to-date
		for(let team=0;team<=1;team++) {
			if (row==0) 
				this.#totalsToDate[0][team]=teamScores[team];
			else 
				this.#totalsToDate[row][team]=this.#totalsToDate[row-1][team]+teamScores[team]-this.bagAdjustment(row,team);
		}
	}
	
	bagAdjustment(row,team) {
		if (row<=0)
			return 0;
		
		let prevBags=0;
		for (let r=0;r<row;r++)
			prevBags+=this.#bags[r][team];
		let currBags=prevBags+this.#bags[row][team];
		
		if (Math.floor(prevBags/10) == Math.floor(currBags/10) )
			return 0;
		else
			return 100;
	}
}
