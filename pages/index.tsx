import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Confetti from "react-confetti";

import {
    useEffect,
    useReducer,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import game, { Card, Foundation, FreeCell, Pillar } from "@/Deck/game";
import { motion, useDragControls } from "framer-motion";

export default function Home() {
    const [isGameInit, setIsGameInit] = useState(false);
    const [, setForceUpdate] = useReducer((x) => x + 1, 0);
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [windowWidth, setWindowWidth] = useState(0);
    const [windowHeight, setWindowHeight] = useState(0);

    const handleSelect = (
        card: Card,
        cardContract: Pillar | FreeCell | Foundation
    ) => {
        if (selectedCards.length === 0) {
            setSelectedCards(selectCards(card, cardContract));
        }
    };

    const handleInsertion = (cardContract: Pillar | FreeCell | Foundation) => {
        if (selectedCards.length > 0) {
            insertCards(
                selectedCards,
                cardContract,
                getOriginalCardContract() as Pillar | FreeCell | Foundation
            );
            setSelectedCards([]);
            game.playerStatus();
        }
    };

    const handleStart = () => {
        game.start();
        setIsGameInit(true);
    };

    const isDraggable = (): boolean => {
        return selectedCards.length > 0;
    };

    const selectCards = (
        card: Card,
        cardContract: Pillar | FreeCell | Foundation
    ): Card[] => {
        setOriginalCardContract(cardContract);
        return game.selectCards(card, cardContract);
    };

    const insertCards = (
        cards: Card[],
        cardContract: Pillar | FreeCell | Foundation,
        originalCardContract: Pillar | FreeCell | Foundation
    ) => {
        game.insertCard(cards, cardContract, originalCardContract);
    };

    const setOriginalCardContract = (
        cardContract: Pillar | FreeCell | Foundation
    ) => {
        return game.setOriginalCardContract(cardContract);
    };

    const getOriginalCardContract = () => {
        return game.getOriginalCardContract();
    };

    const getLastPosition = (
        offsetX: number,
        divisionNumber: number
    ): number => {
        let pos = 0;
        if (offsetX > 0) {
            pos = Math.floor(offsetX / divisionNumber);
        } else pos = Math.ceil(offsetX / divisionNumber);

        if (pos > 7) {
            pos = 7;
        }
        if (pos < -7) {
            pos = -7;
        }
        return pos;
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        window.removeEventListener("resize", handleResize);
        const unsubscribe = game.addListener(setForceUpdate);
        return () => {
            unsubscribe();
        };
    }, [setForceUpdate]);

    return (
        <div className="min-h-screen bg-green-500 p-4">
            {game.playerStatus() === true && isGameInit ? (
                <Confetti width={windowWidth} height={windowHeight} />
            ) : (
                ""
            )}
            <div>
                <button
                    className="bottom-8 right-8 bg-pink-500 text-white p-2 rounded-md  fixed"
                    onClick={handleStart}
                >
                    Start
                </button>
            </div>

            <div className="flex items-between max-w-6xl mx-auto ">
                <div className="flex pt-8 pb-12 w-full mr-24">
                    {game.getFreeCells().map((freeCell, index) => (
                        <div
                            key={index}
                            className="border border-white max-w-[100px] min-h-[150px] rounded-md w-full mr-2"
                            onClick={() => {
                                handleSelect(freeCell.getCards()[0], freeCell);
                                handleInsertion(freeCell);
                            }}
                        >
                            {freeCell.getCards().map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    layoutId={card.id}
                                    className={`
                                ${
                                    card.isSelected
                                        ? `shadow-xl shadow-slate-200  `
                                        : ""
                                }`}
                                >
                                    <Image
                                        src={card.img}
                                        key={card.img}
                                        alt={card.img}
                                        height={10}
                                        width={100}
                                        draggable={false}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex  pt-8 pb-12 w-full">
                    {game.getFoundations().map((foundation, index) => (
                        <div
                            key={index}
                            className="border border-white max-w-[100px] min-h-[150px] rounded-md w-full mr-2 relative"
                            onClick={() => {
                                handleSelect(
                                    foundation
                                        .getCards()
                                        .map((card) => card) as unknown as Card,
                                    foundation
                                );
                                handleInsertion(foundation);
                            }}
                        >
                            {foundation.getCards().map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    className={`absolute
                                ${
                                    card.isSelected
                                        ? `shadow-xl shadow-slate-200  `
                                        : ""
                                }`}
                                    layoutId={card.id}
                                >
                                    <Image
                                        src={card.img}
                                        key={card.img}
                                        alt={card.img}
                                        height={10}
                                        width={100}
                                        draggable={false}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-8">
                {game.getPillars().map((pillar, index) => {
                    return (
                        <motion.div
                            className=" relative border border-white max-w-[100px] min-h-[150px] rounded-md "
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            key={index}
                            onClick={() => {
                                if (pillar.isEmpty()) {
                                    handleSelect(pillar.getCards()[0], pillar);
                                    handleInsertion(pillar);
                                }
                            }}
                        >
                            {pillar.getCards().map((card, i) => {
                                return (
                                    <motion.div
                                        // trying to make the cards draggable
                                        // drag={isDraggable()}
                                        // whileDrag={{ zIndex: 1 }}
                                        // dragSnapToOrigin={true}
                                        // onDragStart={() => {
                                        //     handleSelect(card, pillar);
                                        // }}
                                        // onDragEnd={(e, info) => {
                                        //     const pos = getLastPosition(
                                        //         info.offset.x,
                                        //         140
                                        //     );
                                        //     handleInsertion(
                                        //         game.getPillars()[index + pos]
                                        //     );
                                        // }}
                                        //end of try
                                        layoutId={card.id}
                                        key={card.id}
                                        className={`absolute
                                         ${
                                             card.isSelected
                                                 ? `shadow-xl shadow-slate-200`
                                                 : ""
                                         }`}
                                        onClick={() => {
                                            handleSelect(card, pillar);
                                            handleInsertion(pillar);
                                        }}
                                        style={{ top: `${i * 30}px` }}
                                    >
                                        <Image
                                            src={card.img}
                                            alt={card.img}
                                            height={100}
                                            width={100}
                                            draggable={false}
                                        />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
