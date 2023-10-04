const images = [
    "./images/at_coder.jpg",
  "./images/code_chef.jpg",
  "./images/codeforces.jpg",
  "./images/codeforces_gym.jpg",
  "./images/hacker_earth.jpg",
  "./images/hacker_rank.jpg",
  "./images/leet_code.jpg",
  "./images/top_coder.jpg",

];

let platformUrl ="https://kontests.net/api/v1/";
let websiteUrl = "https://kontests.net/api/v1/sites";

let contestData = [];
let failedFetch = [];

let platformContainer = document.querySelector(".platform-container");
let contestContainer = document.querySelector(".contest-container");
let submitButton  = document.querySelector(".submit-btn");


//making an api call for retrieving all the coding platforms and integrating in the web page.
const getPlatforms = async()=> {
    const response = await fetch(websiteUrl);
    if(response.ok) {
        const data = await response.json();
        console.log(data);
        platformContainer.innerHTML="";
        data.forEach(platform => {
            if(platform[0] != "CS Academy" && platform[0]!="Toph") {
                const element  = document.createElement("button");
                element.innerHTML=platform[0];
                element.classList.add("platform-btn");
                element.setAttribute("id",platform[1]);
                element.addEventListener("click",()=>{
                    element.classList.toggle("selected");
                });
                platformContainer.appendChild(element);
            }

        });
    const getContestButton = document.createElement("button");
    getContestButton.classList.add("get-contest-btn");
    getContestButton.innerHTML="Get Contests";
    getContestButton.addEventListener("click",()=>getContestButtonClick());
    submitButton.append(getContestButton);
    }
    else {
        platformContainer.innerHTML="";
         const err = document.createElement("h3");
         err.innerHTML="error while loading the platforms..";
         platformContainer.appendChild(err);
    }
}
getPlatforms();

//handling the click operation on getcontest button

const getContestButtonClick = () => {
    let allPlatforms = Array.from(document.querySelectorAll(".platform-btn"));
    let selectedPlatforms = allPlatforms.filter(platform => platform.classList.contains("selected"));
    let selectedPlatformsId = selectedPlatforms.map(platform=>platform.getAttribute("id"));
   // console.log(selectedPlatforms);
    contestContainer.innerHTML="";
    contestData = [];
    getContests(selectedPlatformsId);
    for(let i=0;i<selectedPlatforms.length;i++) {
        selectedPlatforms[i].classList.remove("selected");
    }
}

const getContests = async(selectedPlatformsId) => {
    if(selectedPlatformsId.length==0)
    {
        contestContainer.innerHTML=`<h3> please select a platform</h3>`
    }
    else
    {
        contestContainer.innerHTML=`<div> <h2> Loading....</h2></div>`
        for(let i=0;i<selectedPlatformsId.length;i++) {
            contestUrl = platformUrl + selectedPlatformsId[i];
            console.log(contestUrl);
            await getEveryContest(contestUrl,selectedPlatformsId[i]);
        }
}
    sortContestData(contestData);
   
    displayData();
}
//using fetch to call the api for getting data of each contest
    const getEveryContest = async(contestUrl,platform)=> {
        const response = await fetch(contestUrl);
        if(response.ok) {
            const data = await response.json();
            console.log(data);
            contestData = contestData.concat(data);
            console.log(contestData);
            data.forEach((contest) => {
                contest.imgUrl = images[getImage(platform)];
            });
        }
        else {
            failedFetch = failedFetch.concat(platform);
        }
    }
    
//returning the image of the platform
    const getImage = (platform) => {
        if (platform === "at_coder") return 0;
        if (platform === "code_chef") return 1;
        if (platform === "codeforces") return 3;
        if (platform === "codeforces_gym") return 3;
        if (platform === "hacker_earth") return 4;
        if (platform === "hacker_rank") return 5;
        if (platform === "leet_code") return 6;
        if (platform === "top_coder") return 7;
      };


//sorting the data according to the start-time of contest using merge sort.

function sortContestData(contestData, leftIndex = 0, rightIndex = contestData.length - 1) {
    if (leftIndex < rightIndex) {
      const middle = Math.floor((leftIndex + rightIndex) / 2);
      sortContestData(contestData, leftIndex, middle);
      sortContestData(contestData, middle + 1, rightIndex);
      merge(contestData, leftIndex, middle, rightIndex);
    }
  }
  
  function merge(contestData, lo, mid, hi) {
    let temp = [];
    let i=lo;
    let j=mid+1;
    let k = 0;
    while (i <= mid && j <=hi) {
      if (new Date(contestData[i].start_time).getTime() <= new Date(contestData[j].start_time).getTime()) {
        temp[k] = contestData[i];
        i++;
      } else {
        temp[k] = contestData[j];
        j++;
      }
      k++;
    }
  
    while(i<=mid) {
        temp[k] = contestData[i];
        i++;
        k++;
    }
    while(j <= hi) {
        temp[k] = contestData[j];
        j++;
        k++;
    }
    for(let i=lo;i<=hi;i++) {
        contestData[i] = temp[i-lo];
    }
  }



//parsing the contest data and integrating in the web page.
  const displayData = () => {
    contestContainer.innerHTML="";
    if (failedFetch.length > 0) {
        const element = document.createElement("div");
        element.innerHTML = `<h4>Unable to fetch contests from:${failedFetchPlatforms().toUpperCase()}
        </h4>`;
        contestContainer.appendChild(element);
      }
      if (contestData.length == 0) {
        const element = document.createElement("div");
        element.classList.add("select");
        element.innerHTML = `<h4>No contests available</h4>`;
        contestContainer.appendChild(element);
      }
    
    contestData.forEach(({name,url,start_time,end_time,duration,imgUrl,status}) => {
        let singleContest = document.createElement("div");
        singleContest.classList.add("single-contest");
        const time = timeString(calculateTIme(duration));
        singleContest.innerHTML = 
        `<div class="single-contest-container">
        <div class="contest-image-container">
            <img src="${imgUrl}" class="contest-image">
        </div>
        <div class="contest-info-container">  
            <div>Name : ${name}</div> 
            <div>Start-time : ${new Date(start_time)}</div>
            <div> Duration : ${time}</div>
            <div>Link : <a href="${url}" target=_"blank">${url}<\a></div>
            <div> Status : ${status=="BEFORE"?"Not Yet Commenced":"Ongoing"}</div>
        </div>
        </div>`
        contestContainer.appendChild(singleContest);
    });
  }


//converting time into proper format
  const calculateTIme = (seconds) => {

    const years = Math.floor(seconds / (60 * 60 * 24 * 365));
    seconds = seconds % (60 * 60 * 24 * 365);
    const months = Math.floor(seconds / (60 * 60 * 24 * 30));
    seconds = seconds % (60 * 60 * 24 * 30);
    const days = Math.floor(seconds / (60 * 60 * 24));
    seconds = seconds % (60 * 60 * 24);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const mins = Math.floor(seconds / 60);
    const time = { years, months, days, hours, mins };
    return time;
};




//function to make years ,days,months,hours,mins into a string
const timeString = ({ years, months, days, hours, mins }) => {
  let string = "";
  if (years > 0) string += ` ${years} years`;
  if (months > 0) string += ` ${months} months`;
  if (days > 0) string += ` ${days} days`;
  if (hours > 0) string += ` ${hours} hours`;
  if (mins > 0) string += ` ${mins} minutes`;
  return string;
};



//if no result from api call,handling failure
const failedFetchPlatforms = () => {
    let platforms = "";
    for (let i = 0; i < failedFetch.length; i++) {
      if (i == failedFetch.length - 1) platforms += failedFetch[i];
      else platforms += failedFetch[i] + ",";
    }
    return platforms;
  };