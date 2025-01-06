import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import EventsTable from "./EventsTable";
import { toast } from "react-toastify";
import { getEvents, updateEventPayloads } from "@/lib/scheduler";
import { FaPlus } from "react-icons/fa";
import TooltipButton from "./TooltipButton";
import CreatingEventScreen from "./CreatingEventScreen";
import { CreateEventData } from "@/lib/types";
import { FaSave } from "react-icons/fa";
import { usePlayer } from "@/context/PlayerContext";

type Props = {
  handleClose: () => void;
};

const EventsPopup = ({ handleClose }: Props) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [inputValue, setInputValue] = useState<CreateEventData>({
    name: "",
    function: "",
    recurring: null,
    date: null,
    days: [],
    time: "",
  });
  const { player } = usePlayer();

  const fetchData = async () => {
    try {
      const res = await getEvents();
      if (res === "err") {
        toast.error("Failed to fetch events");
        return;
      }
      setData(res);

      const checkedIds = res.filter((item) => item.payload.includes(player.toString() || player)).map((item) => item.id);

      setChecked(checkedIds);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchData();
  }, [showCreate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValue((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await updateEventPayloads(checked, player)
      if(res === 'err') {
        toast.error('Failed to save events')   
        return
      }
      toast.success('Events saved')
      fetchData()
    } catch (error) {
      toast.error('Failed to save events')   
    }
  }

  return (
    <div className="fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40">
      <div
        ref={boxRef}
        className="bg-dark-100 rounded-md text-sm text-gray-200"
      >
        {showCreate ? (
          <CreatingEventScreen
            handleClose={() => setShowCreate(false)}
            setInputValue={setInputValue}
            handleChange={handleChange}
            inputValue={inputValue}
          />
        ) : (
          <div className="py-4">
            <div className="flex justify-between items-center mb-10 px-8">
              <p className="text-3xl font-bold mr-10">Events</p>
              <div className="flex items-center gap-2">
                <TooltipButton onClick={handleSubmit} text="Create Event">
                  <FaSave className="text-blue-500" />
                </TooltipButton>
                <TooltipButton
                  onClick={() => setShowCreate(true)}
                  text="Create Event"
                >
                  <FaPlus className="text-green-500" />
                </TooltipButton>
              </div>
            </div>
            {data && (
              <EventsTable
                fetchData={fetchData}
                data={data}
                checked={checked}
                setChecked={setChecked}
              />
            )}{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPopup;
