import { Link } from "react-router-dom";

const CommunityCard = ({ community, className }) => {

    let { name, image, membersCount, interests, community_id } = community;

    return (
        <Link to={`/communities/${community_id}`} className={"flex gap-5 items-center mb-5 border-b border-grey pb-4 " + className}>
            <img src={image} className="w-14 h-14 rounded-full" />

            <div>
                <h1 className="font-medium text-xl mb-3 line-clamp-1">{ name }</h1>
                {
                    (interests && membersCount) &&
                    <div className="flex gap-2 items-center">
                        <p className="tag py-1.5 px-5">{interests[0]}</p>
                        <p>{membersCount} members</p>
                    </div>
                }
            </div>
        </Link>
    )

}

export default CommunityCard;