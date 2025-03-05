import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DocsIndexingStatuses from "../../components/indexing/DocsIndexingStatuses";
import PageHeader from "../../components/PageHeader";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import IndexingProgress from "./IndexingProgress";

function MorePage() {
  useNavigationListener();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const config = useAppSelector((store) => store.config.config);
  const { disableIndexing } = config;

  return (
    <div className="overflow-y-scroll">
      <PageHeader onTitleClick={() => navigate("/")} title="Chat" />

      <div className="gap-2 divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
        <div className="py-5">
          <div>
            <h3 className="mx-auto mb-1 mt-0 text-xl">🔃 Ré-indexation</h3>
            <span className="w-3/4 text-xs text-stone-500">
              Indexer votre code pour une meilleure expérience de recherche
            </span>
          </div>
          {disableIndexing ? (
            <div className="pb-2 pt-5 text-center font-semibold">
              Indexation est désactivé
            </div>
          ) : (
            <IndexingProgress />
          )}
        </div>

        <div className="flex flex-col py-5">
          <DocsIndexingStatuses />
        </div>

      </div>
    </div>
  );
}

export default MorePage;
