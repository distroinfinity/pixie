import React, { useEffect, useState } from "react";
import classes from "../../styles/artist.module.css";
import { BsFillPlayCircleFill } from "react-icons/bs";
import SongsList from "../components/songs/songList";
import FansList from "../components/fansList";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { ConnectButton } from "web3uikit";
import Link from "next/link";
import { BiSearch } from "react-icons/bi";
import { AiOutlineHome } from "react-icons/ai";
import { Outlet } from "react-router-dom";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { MdLibraryMusic } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { useRouter } from "next/router";
// import Logo from "./../assets/logo2.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import axios from "axios";
import Identicon from "identicon.js";
import Web3Modal from "web3modal";

import { marketplaceAddress } from "../../../backend/config";
import NFTMarketplace from "../../../backend/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

import sha256 from "../helperfunctions/hash";

function Artist({ setSongLink, songLink }) {
  const [tracks, setTracks] = useState([]);
  const [fans, setFans] = useState([]);
  const [events, setEvents] = useState([]);

  const router = useRouter();
  const [artistId, setArtistId] = useState(null);

  useEffect(() => {
    loadData();
    loadEvents();
  }, []);

  async function loadEvents() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );

    console.log("artist is", router.query.artistId);
    const data = await contract.fetchEvents(router.query.artistId);
    console.log("event data", data);

    const items = await Promise.all(
      data.map(async (i) => {
        let price =
          ethers.utils.formatUnits(i._priceOfTicket.toString(), "ether") * 1e18;
        let noOfTickets =
          ethers.utils.formatUnits(i.noOfTickets.toString(), "ether") * 1e18;
        let eventId =
          ethers.utils.formatUnits(i.eventId.toString(), "ether") * 1e18;

        let item = {
          description: i.description,
          meetlink: i.meetlink,
          name: i.name,
          schedule: i.schedule,
          noOfTickets: noOfTickets,
          price: price,
          eventId: eventId,
        };
        return item;
      })
    );
    console.log("refined events", items);
    setEvents(items);
  }

  async function loadData() {
    await fetchTracks(router.query.artistId);
    await fetchFans(router.query.artistId);
  }

  async function fetchTracks(artist) {
    if (tracks.length > 0) return;
    // console.log("artist id is  ", artist);
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );
    const data = await contract.fetchNFTSforArtist(artist);

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        // console.log("meta data is", meta.data.image);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        const hash = await sha256(
          tokenUri.replace("https://music-mania.infura-ipfs.io/ipfs/", "")
        );
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenURI: hash,
          artist: i.artist,
          sold: i.sold,
          audio: meta.data.image,
          cover: i.cover,
        };
        return item;
      })
    );
    // console.log("refined are..", items);
    setTracks(items);
  }

  async function fetchFans(artist) {
    if (!artist) return;
    // console.log("artist id is  ", artist);
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider
    );

    const data = await contract.fetchFansforArtist(artist);
    // console.log("fans... ", data);

    const items = await Promise.all(
      data.map(async (i) => {
        let amount = ethers.utils.formatUnits(i.amount.toString(), "ether");
        let type =
          ethers.utils.formatUnits(i.fanType.toString(), "ether") * 1e18;
        let item = {
          amount,
          fan: i.fan,
          fanType: type,
        };
        return item;
      })
    );
    // console.log("refined fans", items);
    setFans(items);
  }

  async function handleBuyTicket(event) {
    console.log("Buying this ticket", event);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    /* user will be prompted to pay the asking proces to complete the transaction */
    console.log("price....", event.price, typeof event.price);
    const price = ethers.utils.parseUnits(event.price.toString(), "ether");
    const transaction = await contract.addInvites(event?.eventId, {
      value: price,
    });
    await transaction.wait();
  }
  return (
    <div>
      <div className="header_main">
        <div className="header_left">
          <Link href="/">
            <img src="/images/logo2.png" />
          </Link>
        </div>
        <div className="header_center">
          {/* <div className="search_div">
            <input
              className="search_input"
              type="text"
              placeholder="Search..."
            />
            <BiSearch />
          </div> */}
        </div>
        <div className="header_right">
          <ConnectButton moralisAuth={false} />
        </div>
      </div>
      <div className="home2">
        <div className="sidebar_main">
          <Link href="/">
            <div className="side_mini">
              <AiOutlineHome />
              <p>Home</p>
            </div>
          </Link>
          <Link href="/addnewmusic">
            <div className="side_mini ">
              <RiMoneyDollarCircleLine />
              <p>Mint new music</p>
            </div>
          </Link>
          <Link href="/mymusic">
            <div className="side_mini">
              <MdLibraryMusic />
              <p>Owned Music</p>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="side_mini">
              <IoPersonOutline />
              <p>Creator Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="home_right1">
          <div className={classes.artist_main}>
            <div className={classes.img_div}>
              <img
                src={`data:image/png;base64,${new Identicon(
                  router.query.artistId,
                  300
                ).toString()}`}
              />
              <h3>{router.query.artistId}</h3>
            </div>
            <div className={classes.artist_songs}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {" "}
                <h2 style={{ marginLeft: "0px" }}>Popular</h2>
              </div>

              <div className={classes.songs_table}>
                {tracks.map((d, index) => (
                  <SongsList
                    setSongLink={setSongLink}
                    songdata={d}
                    index={index}
                  />
                ))}
              </div>
            </div>
            <div className={classes.artist_fans}>
              <h2>Top Fans</h2>
              <div className={classes.songs_table}>
                {fans.map((d, index) => (
                  <FansList fanData={d} index={index} />
                ))}
              </div>
            </div>
            <div className={classes.events_div}>
              <h2>Upcoming Events</h2>
              <div className={classes.songs_table}>
                {events.map((d, index) => (
                  <div className={classes.eventList}>
                    <p>{index + 1}</p>
                    <p style={{ flex: "0.2" }}>{d.name}</p>
                    <p style={{ flex: "0.2" }}>{d.description}</p>
                    <p style={{ flex: "0.2" }}>{d.schedule}</p>
                    <p style={{ flex: "0.2" }}>{d.meetlink}</p>
                    <p>{d.price}</p>
                    <p>{d.noOfTickets}</p>
                    <button
                      // onClick={() => handleBuyTicket(d)}
                      className={classes.buyEvent_btn}
                    >
                      Buy Ticket
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Artist;
